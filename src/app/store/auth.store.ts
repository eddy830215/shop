// auth.store.ts
import { computed } from '@angular/core';
import { appState, updateState } from './app.state';

export class AuthStore {
  // Computed properties
  user = computed(() => appState().user);
  isAuthenticated = computed(() => !!appState().user);

  // Métodos para actualizar el estado
  setUser(user: any) {
    updateState(state => ({ ...state, user }));
  }

  clearUser() {
    updateState(state => ({ ...state, user: null }));
  }

  login(user: any) {
    this.setUser(user);
  }

  logout() {
    this.clearUser();
  }
}

export const authStore = new AuthStore();