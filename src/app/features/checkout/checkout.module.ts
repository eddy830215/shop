import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CheckoutComponent } from './checkout.component';
import { CheckoutSuccessComponent } from './checkout-success/checkout-success.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    CheckoutComponent,
    CheckoutSuccessComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: CheckoutComponent },
      { path: 'success', component: CheckoutSuccessComponent }
    ])
  ]
})
export class CheckoutModule { }