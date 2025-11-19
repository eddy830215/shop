import { Component, signal, computed, inject } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { authStore } from '../../../store/auth.store';

// Validador personalizado para confirmar contraseña
export function confirmPasswordValidator(controlName: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const password = control.parent?.get('password');
    const confirmPassword = control.parent?.get(controlName);
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  registerForm = this.fb.group({
    username: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
      Validators.pattern(/^[a-zA-Z0-9_]+$/)
    ]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    ]],
    confirmPassword: ['', [
      Validators.required,
      confirmPasswordValidator('confirmPassword')
    ]],
    agreeToTerms: [false, [Validators.requiredTrue]]
  });

  // Computed properties para validación visual
  usernameValid = computed(() => {
    const username = this.username;
    return username?.valid && username?.touched;
  });

  usernameInvalid = computed(() => {
    const username = this.username;
    return username?.invalid && username?.touched;
  });

  emailValid = computed(() => {
    const email = this.email;
    return email?.valid && email?.touched;
  });

  emailInvalid = computed(() => {
    const email = this.email;
    return email?.invalid && email?.touched;
  });

  passwordValid = computed(() => {
    const password = this.password;
    return password?.valid && password?.touched;
  });

  passwordInvalid = computed(() => {
    const password = this.password;
    return password?.invalid && password?.touched;
  });

  confirmPasswordValid = computed(() => {
    const confirmPassword = this.confirmPassword;
    return confirmPassword?.valid && confirmPassword?.touched;
  });

  confirmPasswordInvalid = computed(() => {
    const confirmPassword = this.confirmPassword;
    return confirmPassword?.invalid && confirmPassword?.touched;
  });

  // Getters para los controles del formulario
  get username(): AbstractControl | null {
    return this.registerForm.get('username');
  }

  get email(): AbstractControl | null {
    return this.registerForm.get('email');
  }

  get password(): AbstractControl | null {
    return this.registerForm.get('password');
  }

  get confirmPassword(): AbstractControl | null {
    return this.registerForm.get('confirmPassword');
  }

  get agreeToTerms(): AbstractControl | null {
    return this.registerForm.get('agreeToTerms');
  }

  // Métodos para mostrar/ocultar contraseña
  togglePasswordVisibility() {
    this.showPassword.update(show => !show);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update(show => !show);
  }

  // Método para enviar el formulario
  onSubmit() {
    if (this.registerForm.valid) {
      this.loading.set(true);

      // Simulamos el registro (en una app real, esto llamaría a un servicio de registro)
      setTimeout(() => {
        const formValue = this.registerForm.value;
        
        // Simular llamada a API de registro
        this.apiService.login({
          email: formValue.email,
          password: formValue.password
        }).subscribe({
          next: (user) => {
            // Crear usuario con datos del registro
            const newUser = {
              id: Math.floor(Math.random() * 1000) + 1,
              email: formValue.email!,
              username: formValue.username!,
              token: 'fake-jwt-token-' + Date.now()
            };

            authStore.setUser(newUser);
            this.notificationService.success(
              '¡Cuenta creada exitosamente!',
              'Bienvenido a FakeStore'
            );
            this.router.navigate(['/']);
          },
          error: (error) => {
            this.notificationService.error(
              'Error al crear la cuenta',
              'Por favor, intenta nuevamente'
            );
            this.loading.set(false);
          },
          complete: () => {
            this.loading.set(false);
          }
        });
      }, 1500);
    } else {
      this.markFormGroupTouched();
    }
  }

  // Método para marcar todos los campos como touched
  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  // Método para obtener clases dinámicas del input
  getInputClasses(field: AbstractControl | null): string {
    const baseClasses = 'input-field w-full px-3 py-2 border rounded-md focus:outline-none transition-all duration-300';
    
    if (!field) return baseClasses;
    
    if (field.valid && field.touched) {
      return `${baseClasses} valid`;
    } else if (field.invalid && field.touched) {
      return `${baseClasses} invalid`;
    }
    
    return baseClasses;
  }

  // Método para obtener fortaleza de la contraseña
  getPasswordStrength(): { strength: string; color: string; width: string } {
    const password = this.password?.value || '';
    
    if (password.length === 0) {
      return { strength: '', color: 'bg-gray-200', width: '0%' };
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    switch (strength) {
      case 1:
        return { strength: 'Muy débil', color: 'bg-red-500', width: '20%' };
      case 2:
        return { strength: 'Débil', color: 'bg-orange-500', width: '40%' };
      case 3:
        return { strength: 'Media', color: 'bg-yellow-500', width: '60%' };
      case 4:
        return { strength: 'Fuerte', color: 'bg-green-500', width: '80%' };
      case 5:
        return { strength: 'Muy fuerte', color: 'bg-green-600', width: '100%' };
      default:
        return { strength: '', color: 'bg-gray-200', width: '0%' };
    }
  }

  // Navegar al login
  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}