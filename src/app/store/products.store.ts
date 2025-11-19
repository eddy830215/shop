import { computed } from '@angular/core';
import { appState, updateState, appStateComputed } from './app.state';
import { Product } from '../core/interfaces/models';

export class ProductsStore {
  products = computed(() => appState().products);
  loading = computed(() => appState().loading);
  error = computed(() => appState().error);
  
  featuredProducts = appStateComputed.featuredProducts;
  
  setProducts(products: any[]) {
    updateState(state => ({ ...state, products }));
  }
  
  setLoading(loading: boolean) {
    updateState(state => ({ ...state, loading }));
  }
  
  setError(error: string | null) {
    updateState(state => ({ ...state, error }));
  }
  
  // Método adicional para agregar un producto
  addProduct(product: Product) {
    updateState(state => ({ 
      ...state, 
      products: [...state.products, product] 
    }));
  }
  
  // Método adicional para actualizar un producto
  updateProduct(updatedProduct: Product) {
    updateState(state => ({
      ...state,
      products: state.products.map(p => 
        p.id === updatedProduct.id ? updatedProduct : p
      )
    }));
  }
  
  // Método adicional para eliminar un producto
  removeProduct(productId: number) {
    updateState(state => ({
      ...state,
      products: state.products.filter(p => p.id !== productId)
    }));
  }
}

export const productsStore = new ProductsStore();