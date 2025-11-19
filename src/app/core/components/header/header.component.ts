import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { authStore } from '../../../store/auth.store';
import { cartStore } from '../../../store/cart.store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  isAuthenticated = authStore.isAuthenticated;
  user = authStore.user;
  cartCount = cartStore.cartCount;
  
  // Señales para el estado del UI
  isScrolled = signal(false);
  showMobileMenu = signal(false);
  cartBump = signal(false);

  ngOnInit() {
    // Detectar scroll para efectos en el header
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onWindowScroll.bind(this));
    }

    // Suscribirse a cambios en el carrito para animaciones
    // En Signals, podemos usar effect() o simplemente observar los cambios
    // Para este caso, usamos un enfoque más simple
    
    // Cerrar menú móvil al navegar
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.showMobileMenu.set(false);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onWindowScroll.bind(this));
    }
  }

  private onWindowScroll() {
    const scrollY = window.scrollY;
    this.isScrolled.set(scrollY > 50);
  }

  private triggerCartBump() {
    this.cartBump.set(true);
    setTimeout(() => this.cartBump.set(false), 300);
  }

  logout() {
    authStore.logout();
    this.router.navigate(['/']);
  }

  toggleMobileMenu() {
    this.showMobileMenu.update(show => !show);
  }

  // Método para obtener clases condicionales del badge del carrito
  getCartBadgeClasses(): string {
    const baseClasses = 'absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center';
    const bumpClass = this.cartBump() ? 'animate-bounce' : '';
    const highCountClass = this.cartCount() > 9 ? 'text-[10px]' : '';
    
    return `${baseClasses} ${bumpClass} ${highCountClass}`;
  }
}