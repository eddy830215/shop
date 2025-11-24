import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { cartStore } from '../../store/cart.store';
import { authStore } from '../../store/auth.store';
import { NotificationService } from '../../core/services/notification.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private apiService = inject(ApiService);

  cart = cartStore.cart;
  cartTotal = cartStore.cartTotal;
  user = authStore.user;
  
  processing = signal(false);
  activeStep = signal(1);
  
  // Submission Form
  shippingForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    city: ['', [Validators.required]],
    zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
    country: ['', [Validators.required]]
  });

  // Payment form
  paymentForm = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
    cardHolder: ['', [Validators.required, Validators.minLength(3)]],
    expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]]
  });

  ngOnInit() {
    // If the cart is empty, redirect to the cart
    if (cartStore.cartCount() === 0) {
      this.notificationService.warning('Tu carrito está vacío');
      this.router.navigate(['/cart']);
      return;
    }

    // Preload user data if available
    const currentUser = this.user();
    if (currentUser) {
      this.shippingForm.patchValue({
        email: currentUser.email,
        firstName: currentUser.username?.split(' ')[0] || '',
        lastName: currentUser.username?.split(' ')[1] || ''
      });
    }
  }

  // Getters for forms
  get shippingControls() {
    return this.shippingForm.controls;
  }

  get paymentControls() {
    return this.paymentForm.controls;
  }

  // Step-by-step navigation
  nextStep() {
    if (this.activeStep() === 1 && this.shippingForm.valid) {
      this.activeStep.set(2);
    } else if (this.activeStep() === 2 && this.paymentForm.valid) {
      this.processPayment();
    }
  }

  previousStep() {
    if (this.activeStep() > 1) {
      this.activeStep.update(step => step - 1);
    }
  }

  // Process payment
  processPayment() {
    if (this.shippingForm.valid && this.paymentForm.valid) {
      this.processing.set(true);

      // Simulate payment processing
      setTimeout(() => {
        this.processing.set(false);
        
        // Simulate successful payment
        this.notificationService.success('¡Payment processed successfully!');
        
        // Redirect to the success page
        this.router.navigate(['/checkout/success']);
        
        // Clean the cart after success
        cartStore.clearCart();
      }, 3000);
    } else {
      this.markAllFormsAsTouched();
      this.notificationService.error('Please complete all required fields');
    }
  }

  // Marcar todos los campos como touched para mostrar errores
  private markAllFormsAsTouched() {
    Object.keys(this.shippingForm.controls).forEach(key => {
      const control = this.shippingForm.get(key);
      control?.markAsTouched();
    });

    Object.keys(this.paymentForm.controls).forEach(key => {
      const control = this.paymentForm.get(key);
      control?.markAsTouched();
    });
  }

  // Calcular subtotal de un item
  getItemSubtotal(item: any): number {
    return item.product.price * item.quantity;
  }

  // Volver al carrito
  backToCart() {
    this.router.navigate(['/cart']);
  }

  // Obtener clases para los pasos
  getStepClass(step: number): string {
    if (step < this.activeStep()) {
      return 'bg-green-500 text-white';
    } else if (step === this.activeStep()) {
      return 'bg-primary-600 text-white';
    } else {
      return 'bg-gray-300 text-gray-600';
    }
  }

  // Métodos auxiliares para el template con *ngFor
  trackByIndex(index: number): number {
    return index;
  }

  trackByProductId(index: number, item: any): number {
    return item.product.id;
  }
}