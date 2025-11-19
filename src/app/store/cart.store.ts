import { computed } from '@angular/core';
import { appState, updateState, appStateComputed } from './app.state';

const CART_STORAGE_KEY = 'cart';

// Función para obtener el carrito inicial desde localStorage
const getInitialCart = () => {
  if (typeof window !== 'undefined') {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  }
  return [];
};

export class CartStore {
  cart = computed(() => appState().cart);
  cartCount = appStateComputed.cartCount;
  cartTotal = appStateComputed.cartTotal;

  constructor() {
    // Inicializar el carrito desde localStorage al crear la instancia
    this.initializeCartFromStorage();
  }

  private initializeCartFromStorage() {
    const storedCart = getInitialCart();
    if (storedCart.length > 0) {
      updateState(state => ({
        ...state,
        cart: storedCart
      }));
    }
  }

  private saveCartToStorage() {
    if (typeof window !== 'undefined') {
      const currentCart = appState().cart;
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(currentCart));
    }
  }

  addToCart(product: any, quantity: number = 1) {
    updateState(state => {
      const existingItemIndex = state.cart.findIndex(item => item.product.id === product.id);
      
      let updatedCart;
      if (existingItemIndex > -1) {
        // Producto ya existe, actualizar cantidad
        updatedCart = state.cart.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Producto nuevo
        const newItem = {
          product: { ...product }, // Copia para evitar referencias
          quantity: quantity
        };
        updatedCart = [...state.cart, newItem];
      }

      // Guardar en localStorage después de actualizar el estado
      setTimeout(() => this.saveCartToStorage(), 0);
      
      return { ...state, cart: updatedCart };
    });
  }
  
  removeFromCart(productId: number) {
    updateState(state => {
      const updatedCart = state.cart.filter(item => item.product.id !== productId);
      
      // Guardar en localStorage después de actualizar el estado
      setTimeout(() => this.saveCartToStorage(), 0);
      
      return {
        ...state,
        cart: updatedCart
      };
    });
  }
  
  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    
    updateState(state => {
      const updatedCart = state.cart.map(item =>
        item.product.id === productId 
          ? { ...item, quantity: quantity }
          : item
      );

      // Guardar en localStorage después de actualizar el estado
      setTimeout(() => this.saveCartToStorage(), 0);
      
      return {
        ...state,
        cart: updatedCart
      };
    });
  }
  
  clearCart() {
    updateState(state => {
      // Guardar en localStorage después de actualizar el estado
      setTimeout(() => this.saveCartToStorage(), 0);
      
      return { ...state, cart: [] };
    });
  }
  
  isInCart(productId: number): boolean {
    return appState().cart.some(item => item.product.id === productId);
  }
  
  getProductQuantity(productId: number): number {
    const item = appState().cart.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }

  // Método para debug
  getCartState() {
    return {
      items: appState().cart,
      count: this.cartCount(),
      total: this.cartTotal()
    };
  }

  // Método para forzar la carga desde localStorage (útil si necesitas sincronizar)
  loadFromStorage() {
    this.initializeCartFromStorage();
  }
}

export const cartStore = new CartStore();