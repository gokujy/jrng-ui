import { Injectable, signal } from '@angular/core';

export type JrToastType = 'success' | 'error' | 'warning' | 'info';
export type JrToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface JrToast {
  readonly id: string;
  readonly type: JrToastType;
  readonly title: string;
  readonly message: string;
  readonly duration: number;
}

export interface JrToastOptions {
  readonly type?: JrToastType;
  readonly title?: string;
  readonly message: string;
  readonly duration?: number;
}

@Injectable({ providedIn: 'root' })
export class JrToastService {
  private readonly toastList = signal<readonly JrToast[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly toasts = this.toastList.asReadonly();

  show(options: JrToastOptions): JrToast {
    const toast: JrToast = {
      id: `jr-toast-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: options.type ?? 'info',
      title: options.title ?? this.defaultTitle(options.type ?? 'info'),
      message: options.message,
      duration: options.duration ?? 5000,
    };

    this.toastList.update((items) => [...items, toast]);

    if (toast.duration > 0) {
      const timer = setTimeout(() => this.remove(toast.id), toast.duration);
      this.timers.set(toast.id, timer);
    }

    return toast;
  }

  success(message: string, title = 'Success', duration?: number): JrToast {
    return this.show({ type: 'success', title, message, duration });
  }

  error(message: string, title = 'Error', duration?: number): JrToast {
    return this.show({ type: 'error', title, message, duration });
  }

  warning(message: string, title = 'Warning', duration?: number): JrToast {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(message: string, title = 'Info', duration?: number): JrToast {
    return this.show({ type: 'info', title, message, duration });
  }

  remove(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.toastList.update((items) => items.filter((toast) => toast.id !== id));
  }

  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }

    this.timers.clear();
    this.toastList.set([]);
  }

  private defaultTitle(type: JrToastType): string {
    const titles: Record<JrToastType, string> = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
    };

    return titles[type];
  }
}
