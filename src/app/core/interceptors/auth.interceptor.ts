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
        let errorMessage = 'Ha ocurrido un error inesperado';
        
        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del lado del servidor
          switch (error.status) {
            case 400:
              errorMessage = 'Solicitud incorrecta';
              break;
            case 401:
              errorMessage = 'No autorizado. Por favor, inicie sesión.';
              authStore.logout();
              break;
            case 403:
              errorMessage = 'Acceso denegado';
              break;
            case 404:
              errorMessage = 'Recurso no encontrado';
              break;
            case 500:
              errorMessage = 'Error interno del servidor';
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