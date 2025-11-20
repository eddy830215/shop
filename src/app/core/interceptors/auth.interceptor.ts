import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { authStore } from '../../store/auth.store';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Agregar headers personalizados
    let modifiedReq = req.clone({
      setHeaders: {
        'X-Custom-Header': 'fake-store-app',
        'Content-Type': 'application/json'
      }
    });

    // Agregar token de autenticación si existe
    const user = authStore.user();
    if (user?.token) {
      modifiedReq = modifiedReq.clone({
        setHeaders: {
          Authorization: `Bearer ${user.token}`
        }
      });
    }

    return next.handle(modifiedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected error has occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del lado del servidor
          switch (error.status) {
            case 400:
              errorMessage = 'Bad Request';
              break;
            case 401:
              errorMessage = 'Unauthorized. Please login.';
              authStore.logout();
              break;
            case 403:
              errorMessage = 'Access denied';
              break;
            case 404:
              errorMessage = 'Resource not found';
              break;
            case 500:
              errorMessage = 'Internal Server Erro';
              break;
            default:
              errorMessage = `Error ${error.status}: ${error.message}`;
          }
        }

        this.notificationService.error(errorMessage);
        return throwError(errorMessage);
      })
    );
  }
}