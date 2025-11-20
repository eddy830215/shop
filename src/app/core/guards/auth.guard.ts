import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    // Verificación síncrona primero para respuesta inmediata
    if (this.authService.isAuthenticatedSync()) {
      return true;
    }

    // Si no está autenticado, redirigir al login
    this.router.navigate(['/auth']);
    return false;
  }
}