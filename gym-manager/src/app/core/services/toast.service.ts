import { Injectable, signal } from '@angular/core';

export type ToastType = 'error' | 'success' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {

  private counter = 0;
  toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'error', duration = 4000) {
    const id = ++this.counter;
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.remove(id), duration);
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string)   { this.show(message, 'error'); }
  warning(message: string) { this.show(message, 'warning'); }

  remove(id: number) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}