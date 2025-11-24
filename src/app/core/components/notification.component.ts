import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  standalone: false
})
export class NotificationComponent {
  private notificationService = inject(NotificationService);
  
  // Acceder directamente a la señal de notificaciones
  notifications = this.notificationService.getNotifications();

  // Método para trackBy en *ngFor
  trackByNotificationId(index: number, notification: any): number {
    return notification.id;
  }

  getNotificationClass(type: string): string {
    const classes: { [key: string]: string } = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    return classes[type] || classes['info'];
  }
  ngAfterViewInit() {
    this.adjustNotificationPosition();
  }

  private adjustNotificationPosition() {
    const toolbar = document.querySelector('.toolbar');
    if (toolbar) {
      const toolbarHeight = toolbar.getBoundingClientRect().height;
      const notificationsContainer = document.querySelector('.notifications-container') as HTMLElement;
      if (notificationsContainer) {
        notificationsContainer.style.top = `${toolbarHeight + 10}px`;
      }
    }
  }

  removeNotification(id: number) {
    this.notificationService.remove(id);
  }
}