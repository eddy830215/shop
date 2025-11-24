import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { cartStore } from '../../store/cart.store';
import { NotificationService } from '../../core/services/notification.service';
import { authStore } from '../../store/auth.store';
import { appState, appStateComputed } from '../../store/app.state';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
})
export class CartComponent {
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  cart = cartStore.cart;
  cartCount = cartStore.cartCount;
  cartTotal = cartStore.cartTotal;
  
  // Usa directamente las computed properties del authStore
  isAuthenticated = authStore.isAuthenticated;
  user = authStore.user;

  // Señal para controlar la carga durante el checkout
  processingCheckout = signal(false);

  // Método para trackBy en *ngFor
  trackByProductId(index: number, item: any): number {
    return item.product.id;
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity < 1) {
      cartStore.removeFromCart(productId);
      this.notificationService.info('Product removed from cart');
    } else {
      cartStore.updateQuantity(productId, quantity);
    }
  }

  removeItem(productId: number) {
    cartStore.removeFromCart(productId);
    this.notificationService.info('Product removed from cart');
  }

  clearCart() {
    cartStore.clearCart();
    this.notificationService.info('Emptying the cart');
  }

  proceedToCheckout() {
    if (this.cartCount() === 0) {
      this.notificationService.warning('Your cart is empty');
      return;
    }
  
    // Verificación simplificada y consistente
    if (!this.isAuthenticated()) {
      this.notificationService.warning('You must login to continue with your purchase');
      
      // Guardar la intención de checkout
      localStorage.setItem('redirectAfterLogin', '/checkout');
      sessionStorage.setItem('pendingCheckout', 'true');
      
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }

  // Método para calcular el subtotal de un item
  getItemSubtotal(item: any): number {
    return item.product.price * item.quantity;
  }
}