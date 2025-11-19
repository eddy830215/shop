import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { authStore } from '../../store/auth.store';

export interface LoginResponse {
  token: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://fakestoreapi.com';
  private tokenKey = 'authToken';
  private userKey = 'authUser'; // Nueva clave para guardar el usuario
  private currentUserSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.currentUserSubject.asObservable();
  
  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthenticationStatus();
  }

  private checkAuthenticationStatus(): void {
    const token = this.getToken();
    const isAuthenticated = !!token;
    this.currentUserSubject.next(isAuthenticated);
    
    // Sincronizar con el authStore
    if (isAuthenticated) {
      // Intentar recuperar el usuario del localStorage
      const storedUser = localStorage.getItem(this.userKey);
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        authStore.setUser(user);
      } else {
        // Si no hay usuario almacenado, crear uno básico
        const basicUser = {
          id: 1,
          username: 'user',
          email: 'user@example.com'
        };
        authStore.setUser(basicUser);
      }
    } else {
      authStore.clearUser();
    }
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          this.currentUserSubject.next(true);
          
          // Crear usuario y guardarlo en localStorage
          const user: User = {
            id: 1, // En una API real, esto vendría de la respuesta
            username: username,
            email: `${username}@example.com`
          };
          localStorage.setItem(this.userKey, JSON.stringify(user));
          authStore.setUser(user);
        }
      }),
      map(response => !!response.token),
      catchError(error => {
        console.error('Login error:', error);
        return of(false);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey); // Limpiar también el usuario
    this.currentUserSubject.next(false);
    authStore.clearUser();
    this.router.navigate(['/auth']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  isAuthenticatedSync(): boolean {
    return !!this.getToken();
  }
}