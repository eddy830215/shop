import { Component, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { productsStore } from '../../../store/products.store';
import { cartStore } from '../../../store/cart.store';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product = signal<any>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');

  // Formulario para la cantidad
  quantityForm = this.fb.group({
    quantity: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
  });

  // Computed para productos relacionados
  relatedProducts = computed(() => {
    const currentProduct = this.product();
    if (!currentProduct) return [];

    return productsStore.products().filter(p => 
      p.category === currentProduct.category && p.id !== currentProduct.id
    ).slice(0, 4);
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadProduct();
  }

  loadProduct() {
    this.loading.set(true);
    this.error.set('');
    
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (isNaN(productId)) {
      this.error.set('Invalid product ID');
      this.loading.set(false);
      return;
    }

    // Primero intenta buscar el producto en el store
    const existingProduct = productsStore.products().find(p => p.id === productId);
    
    if (existingProduct) {
      this.product.set(existingProduct);
      this.loading.set(false);
    } else {
      // Si no está en el store, carga desde la API
      this.apiService.getProduct(productId).subscribe({
        next: (product) => {
          this.product.set(product);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set('Error loading product');
          this.notificationService.error('The product could not be loaded');
          this.loading.set(false);
        }
      });
    }
  }

  // Métodos para el rating
  getStarRating(rate: number): { full: number; half: boolean; empty: number } {
    const fullStars = Math.floor(rate);
    const halfStar = rate % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return { full: fullStars, half: halfStar, empty: emptyStars };
  }

  getArray(length: number): number[] {
    return Array(length).fill(0);
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByProductId(index: number, product: any): number {
    return product.id;
  }

  // Método para obtener el valor de cantidad de forma segura
  getQuantityValue(): number {
    return this.quantity.value || 1;
  }

  // Métodos para el formulario de cantidad
  incrementQuantity(): void {
    const current = this.getQuantityValue();
    if (current < 10) {
      this.quantity.setValue(current + 1);
    }
  }

  decrementQuantity(): void {
    const current = this.getQuantityValue();
    if (current > 1) {
      this.quantity.setValue(current - 1);
    }
  }

  get quantity(): FormControl {
    return this.quantityForm.get('quantity') as FormControl;
  }

  // Agregar al carrito sin redirigir
  addToCart(): void {
    const product = this.product();
    const quantity = this.getQuantityValue();
    
    if (product && this.quantityForm.valid) {
      try {
        // Agrega el producto con la cantidad especificada
        cartStore.addToCart(product, quantity);
        
        this.notificationService.success(
          'Product added to cart',
          `${product.title} (${quantity} ${quantity === 1 ? 'unidad' : 'units'})`
        );
      } catch (error) {
        this.notificationService.error('Error adding product to cart');
      }
    } else {
      this.notificationService.error('Please enter a valid amount');
    }
  }

  // Agregar al carrito y redirigir al carrito
  buyNow(): void {
    this.router.navigate(['/cart']);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}