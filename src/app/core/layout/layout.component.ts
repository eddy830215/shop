import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { cartStore } from '../../store/cart.store';
import { authStore } from '../../store/auth.store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  username: string = '';
  
  // Exponemos las señales del carrito
  cartCount = cartStore.cartCount;
  cartTotal = cartStore.cartTotal;

  private authSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar el estado de autenticación inicial
    this.isAuthenticated = this.authService.isAuthenticatedSync();
    
    // Suscribirse a cambios de autenticación
    this.authSubscription = this.authService.isAuthenticated().subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
        this.updateUsername();
      }
    );

    // Actualizar username inicial
    this.updateUsername();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private updateUsername(): void {
    const currentUser = authStore.user();
    if (currentUser && this.isAuthenticated) {
      this.username = currentUser.username || 'User';
    } else {
      this.username = '';
    }
  }

  logout(): void {
    this.authService.logout();
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}