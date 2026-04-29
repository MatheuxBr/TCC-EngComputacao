import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  private idCounter = 0;

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 4000) {
    // Pop-ups de alertas desativados
    // const id = this.idCounter++;
    // const newToast: Toast = { message, type, id };
    // 
    // this.toasts.update(current => [...current, newToast]);

    // setTimeout(() => {
    //   this.remove(id);
    // }, duration);
  }

  remove(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
