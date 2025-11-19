import { signal, computed } from '@angular/core';
import { Product, CartItem, User } from '../core/interfaces/models';

export interface AppState {
  user: User | null;
  products: Product[];
  cart: CartItem[];
  loading: boolean;
  error: string | null;
}

export const initialState: AppState = {
  user: null,
  products: [],
  cart: [],
  loading: false,
  error: null
};

// Creamos el estado como una señal writable
const state = signal<AppState>(initialState);

// Exportamos el estado como readonly para las lecturas
export const appState = state.asReadonly();

// Función para actualizar el estado
export function updateState(updater: (currentState: AppState) => AppState): void {
  state.update(updater);
}

// Computed values comunes
export const appStateComputed = {
  isAuthenticated: computed(() => !!appState().user),
  cartCount: computed(() => 
    appState().cart.reduce((total, item) => total + item.quantity, 0)
  ),
  cartTotal: computed(() =>
    appState().cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  ),
  featuredProducts: computed(() => 
    appState().products.filter(p => p.rating?.rate > 4.5).slice(0, 6)
  )
};

// Store específico para productos (para mantener compatibilidad con tu código existente)
export const productsStore = {
  products: computed(() => appState().products),
  loading: computed(() => appState().loading),
  error: computed(() => appState().error),
  
  setProducts(products: Product[]) {
    updateState(current => ({ ...current, products }));
  },
  
  setLoading(loading: boolean) {
    updateState(current => ({ ...current, loading }));
  },
  
  setError(error: string | null) {
    updateState(current => ({ ...current, error }));
  },
  
  addProduct(product: Product) {
    updateState(current => ({ 
      ...current, 
      products: [...current.products, product] 
    }));
  },
  
  updateProduct(updatedProduct: Product) {
    updateState(current => ({
      ...current,
      products: current.products.map(p => 
        p.id === updatedProduct.id ? updatedProduct : p
      )
    }));
  },
  
  removeProduct(productId: number) {
    updateState(current => ({
      ...current,
      products: current.products.filter(p => p.id !== productId)
    }));
  }
};