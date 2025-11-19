import { Component } from '@angular/core';
import { authStore } from './store/auth.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isAuthenticated = authStore.isAuthenticated;
  title = 'Mi Tienda';
}
