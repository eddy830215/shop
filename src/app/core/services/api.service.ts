import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { mergeMap, concatMap, switchMap } from 'rxjs/operators';
import { Product, User } from '../interfaces/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  [x: string]: any;
  private baseUrl = 'https://fakestoreapi.com';

  constructor(private http: HttpClient) {}

  // Método para demostrar llamadas anidadas con operadores RxJS
  getProductsWithDetails(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`).pipe(
      switchMap(products => {
        // Para cada producto, podríamos hacer llamadas adicionales
        // En este caso simulamos llamadas adicionales para cada categoría
        const categories = [...new Set(products.map(p => p.category))];
        
        // Simulamos llamadas para cada categoría (en un caso real sería otra API)
        return of(products).pipe(
          mergeMap(prods => {
            return of(prods);
          })
        );
      })
    );
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/products/categories`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/category/${category}`);
  }

  // Autenticación simulada
  login(credentials: any): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/auth/login`, credentials);
  }

  getCurrentUser(): Observable<User> {
    // Simulamos obtener usuario actual
    return of({
      id: 1,
      email: 'user@example.com',
      username: 'johndoe'
    });
  }
}