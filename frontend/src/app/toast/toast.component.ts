import { Component, inject } from '@angular/core';
import { ToastService } from '../toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [ngClass]="toast.type">
          <div class="icon">
            @switch (toast.type) {
              @case ('success') { <span>✓</span> }
              @case ('error') { <span>✕</span> }
              @case ('warning') { <span>!</span> }
              @case ('info') { <span>i</span> }
            }
          </div>
          <div class="message">{{ toast.message }}</div>
          <button class="close-btn" (click)="toastService.remove(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      padding: 15px 20px;
      background: #1e293b;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      color: white;
      min-width: 250px;
      animation: slideIn 0.3s ease-out forwards;
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
    }

    .toast::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0; width: 4px;
    }

    .toast.success::before { background-color: #10b981; }
    .toast.error::before { background-color: #ef4444; }
    .toast.warning::before { background-color: #f59e0b; }
    .toast.info::before { background-color: #3b82f6; }

    .icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 12px;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .toast.success .icon { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .toast.error .icon { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .toast.warning .icon { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .toast.info .icon { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }

    .message {
      flex: 1;
      font-size: 0.95rem;
      font-family: 'Inter', sans-serif;
    }

    .close-btn {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.2rem;
      cursor: pointer;
      margin-left: 10px;
      padding: 0;
    }

    .close-btn:hover {
      color: white;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
