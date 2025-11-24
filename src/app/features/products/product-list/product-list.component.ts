import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { productsStore } from '../../../store/products.store';
import { cartStore } from '../../../store/cart.store';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  searchForm = this.fb.group({
    search: ['']
  });

  selectedCategory = signal<string>('all');
  categories = signal<string[]>([]);
  searchTerm = signal<string>('');
  
  // Exponemos las señales del store directamente
  loading = productsStore.loading;
  error = productsStore.error;
  
  // Computed properties mejoradas
  filteredProducts = computed(() => {
    const products = productsStore.products();
    const searchTerm = this.searchTerm();
    const category = this.selectedCategory();
    
    if (!products) return [];

    let filtered = products;

    // Filtro por categoría
    if (category !== 'all') {
      filtered = filtered.filter(product => product.category === category);
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }

    return filtered;
  });

  // Computed para información de búsqueda
  hasActiveSearch = computed(() => {
    return this.searchTerm().length > 0;
  });

  searchResultsCount = computed(() => {
    return this.filteredProducts().length;
  });

  // Computed para mostrar información de filtros activos
  activeFilters = computed(() => {
    const filters = [];
    if (this.selectedCategory() !== 'all') {
      filters.push(`Category: ${this.selectedCategory()}`);
    }
    if (this.searchTerm()) {
      filters.push(`Search: "${this.searchTerm()}"`);
    }
    return filters;
  });

  constructor() {
    // Reactividad en el formulario de búsqueda con debounce
    this.searchForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchValue => {
        this.searchTerm.set(searchValue?.toLowerCase() || '');
      });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  // Método para trackBy en *ngFor
  trackByProductId(index: number, product: any): number {
    return product.id;
  }

  loadProducts() {
    productsStore.setLoading(true);
    
    this.apiService.getProductsWithDetails().subscribe({
      next: (products) => {
        productsStore.setProducts(products);
      },
      error: (error) => {
        productsStore.setError('Error loading products');
        this.notificationService.error('The products could not be loaded');
      },
      complete: () => {
        productsStore.setLoading(false);
      }
    });
  }

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(['all', ...categories]);
      },
      error: (error) => {
        this.notificationService.error('Error loading categories');
      }
    });
  }

  onCategoryChange(category: string) {
    this.selectedCategory.set(category);
  }

  addToCart(product: any) {
    try {
      cartStore.addToCart(product);
      this.notificationService.success(
        'Product added to cart',
        `${product.title}`
      );
    } catch (error) {
      this.notificationService.error('Error adding product to cart');
    }
  }

  viewProductDetails(productId: number) {
    this.router.navigate(['/products', productId]);
  }

  // Nuevos métodos para gestión de búsqueda
  clearSearch() {
    this.searchForm.patchValue({ search: '' });
    this.searchTerm.set('');
  }

  clearAllFilters() {
    this.selectedCategory.set('all');
    this.clearSearch();
  }
}