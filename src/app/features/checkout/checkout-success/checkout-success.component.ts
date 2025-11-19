import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-success',
  templateUrl: './checkout-success.component.html',
  styleUrls: ['./checkout-success.component.scss']
})
export class CheckoutSuccessComponent {
  private router = inject(Router);

  today = signal(new Date());
  orderNumber = signal(this.generateOrderNumber());

  private generateOrderNumber(): number {
    return 123456 + Math.floor(Math.random() * 1000);
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }

  viewOrders() {
    // In a real application, it would redirect to the orders page
    this.router.navigate(['/products']);
  }
}