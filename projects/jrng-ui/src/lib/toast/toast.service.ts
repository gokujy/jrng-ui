import { DestroyRef, Injectable, inject, signal } from '@angular/core';

export type JToastSeverity = 'success' | 'error' | 'warning' | 'info';
export type JToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
export type JrToastType = JToastSeverity;
export type JrToastPosition = JToastPosition;

export interface JToast {
  readonly id: string;
  readonly severity: JToastSeverity;
  readonly type: JToastSeverity;
  readonly summary: string;
  readonly title: string;
  readonly detail: string;
  readonly message: string;
  readonly life: number;
  readonly duration: number;
  readonly sticky: boolean;
  readonly closable: boolean;
  readonly position: JToastPosition;
}

export interface JToastOptions {
  readonly severity?: JToastSeverity;
  readonly type?: JToastSeverity;
  readonly summary?: string;
  readonly title?: string;
  readonly detail?: string;
  readonly message?: string;
  readonly life?: number;
  readonly duration?: number;
  readonly sticky?: boolean;
  readonly closable?: boolean;
  readonly position?: JToastPosition;
}

export type JrToast = JToast;
export type JrToastOptions = JToastOptions;

@Injectable({ providedIn: 'root' })
export class JrToastService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastList = signal<readonly JToast[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly toasts = this.toastList.asReadonly();

  constructor() {
    this.destroyRef.onDestroy(() => this.clear());
  }

  success(message: string, title = 'Success', options?: JToastOptions | number): JToast {
    return this.show(this.normalizeShortcut('success', message, title, options));
  }

  error(message: string, title = 'Error', options?: JToastOptions | number): JToast {
    return this.show(this.normalizeShortcut('error', message, title, options));
  }

  info(message: string, title = 'Info', options?: JToastOptions | number): JToast {
    return this.show(this.normalizeShortcut('info', message, title, options));
  }

  warning(message: string, title = 'Warning', options?: JToastOptions | number): JToast {
    return this.show(this.normalizeShortcut('warning', message, title, options));
  }

  show(options: JToastOptions): JToast {
    const severity = options.severity ?? options.type ?? 'info';
    const toast: JToast = {
      id: `j-toast-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      severity,
      type: severity,
      summary: options.summary ?? options.title ?? this.defaultTitle(severity),
      title: options.summary ?? options.title ?? this.defaultTitle(severity),
      detail: options.detail ?? options.message ?? '',
      message: options.detail ?? options.message ?? '',
      life: options.life ?? options.duration ?? 5000,
      duration: options.life ?? options.duration ?? 5000,
      sticky: options.sticky ?? false,
      closable: options.closable ?? true,
      position: options.position ?? 'top-right',
    };

    this.toastList.update((items) => [...items, toast]);

    if (!toast.sticky && toast.life > 0) {
      const timer = setTimeout(() => this.remove(toast.id), toast.life);
      this.timers.set(toast.id, timer);
    }

    return toast;
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

  private normalizeShortcut(
    severity: JToastSeverity,
    message: string,
    title: string,
    options?: JToastOptions | number,
  ): JToastOptions {
    return typeof options === 'number'
      ? { severity, summary: title, detail: message, life: options }
      : { ...(options ?? {}), severity, summary: title, detail: message };
  }

  private defaultTitle(severity: JToastSeverity): string {
    const titles: Record<JToastSeverity, string> = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
    };
    return titles[severity];
  }
}
