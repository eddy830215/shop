import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './core/layout/layout.component';

const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { 
        path: 'products', 
        loadChildren: () => import('./features/products/products.module').then(m => m.ProductsModule)
      },
      { 
        path: 'cart', 
        loadChildren: () => import('./features/cart/cart.module').then(m => m.CartModule)
      },
      { 
        path: 'checkout', 
        loadChildren: () => import('./features/checkout/checkout.module').then(m => m.CheckoutModule)
      },
    ]
  },
  { path: '**', redirectTo: '/auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }