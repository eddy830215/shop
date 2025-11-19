import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { SharedModule } from '../../shared/shared.module';
import { CanDeactivateGuard } from '../../core/guards/can-deactivate.guard';

@NgModule({
  declarations: [
    ProductListComponent,
    ProductDetailComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: ProductListComponent },
      { 
        path: ':id', 
        component: ProductDetailComponent,
        canDeactivate: [CanDeactivateGuard]
      }
    ])
  ],
  providers: [CanDeactivateGuard]
})
export class ProductsModule { }