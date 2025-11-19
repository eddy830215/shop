import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private nextId = 1;

  getNotifications() {
    return this.notifications.asReadonly();
  }

  show(notification: Omit<Notification, 'id'>) {
    const id = this.nextId++;
    const newNotification = { ...notification, id };
    
    this.notifications.update(notifs => [...notifs, newNotification]);

    // Auto-remove si tiene duración
    if (notification.duration) {
      setTimeout(() => {
        this.remove(id);
      }, notification.duration);
    }
  }

  success(message: string, title: string = 'Success') {
    this.show({ type: 'success', title, message, duration: 3000 });
  }

  error(message: string, title: string = 'Error') {
    this.show({ type: 'error', title, message, duration: 3000 });
  }

  warning(message: string, title: string = 'Warning') {
    this.show({ type: 'warning', title, message, duration: 3000 });
  }

  info(message: string, title: string = 'Information') {
    this.show({ type: 'info', title, message, duration: 3000 });
  }

  remove(id: number) {
    this.notifications.update(notifs => notifs.filter(n => n.id !== id));
  }

  clear() {
    this.notifications.set([]);
  }
}