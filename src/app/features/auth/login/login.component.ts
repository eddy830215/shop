// login.component.ts
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = signal(false);
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  // Métodos para mostrar/ocultar contraseña
  togglePasswordVisibility() {
    this.showPassword.update(show => !show);
  }
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (success: any) => {
          this.isLoading = false;
          if (success) {
            // Verificar si hay una redirección pendiente
            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            const hasPendingCheckout = sessionStorage.getItem('pendingCheckout');
            
            if (redirectUrl && hasPendingCheckout) {
              // Limpiar los flags de redirección
              localStorage.removeItem('redirectAfterLogin');
              sessionStorage.removeItem('pendingCheckout');
              this.router.navigate([redirectUrl]);
            } else {
              this.router.navigate(['/products']);
            }
          } else {
            this.errorMessage = 'Incorrect credentials. Please try again.';
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = 'Connection error. Please try again later.';
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}