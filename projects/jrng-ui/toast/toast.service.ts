import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type JToastSeverity = 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type JToastPosition =
  'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
export type JrToastType = JToastSeverity;
export type JrToastPosition = JToastPosition;

export interface JToastAction {
  readonly label: string;
  readonly style?: 'primary' | 'secondary' | 'ghost';
  readonly command: (toast: JToast) => void;
}

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
  readonly actions: readonly JToastAction[];
  readonly cancelAction?: JToastAction;
  readonly createdAt: number;
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
  readonly actions?: readonly JToastAction[];
  readonly cancelAction?: JToastAction;
}

export type JrToast = JToast;
export type JrToastOptions = JToastOptions;

@Injectable({ providedIn: 'root' })
export class JrToastService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly toastList = signal<readonly JToast[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly timerEndsAt = new Map<string, number>();
  private readonly remaining = new Map<string, number>();
  private nextId = 0;

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
      id: `j-toast-${++this.nextId}`,
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
      actions: options.actions ?? [],
      cancelAction: options.cancelAction,
      createdAt: Date.now(),
    };

    this.toastList.update((items) => [...items, toast]);

    if (!toast.sticky && toast.life > 0) {
      this.startTimer(toast.id, toast.life);
    }

    return toast;
  }

  promise<T>(
    promise: Promise<T>,
    messages: {
      readonly loading?: JToastOptions;
      readonly success?: JToastOptions | ((value: T) => JToastOptions);
      readonly error?: JToastOptions | ((error: unknown) => JToastOptions);
    },
  ): Promise<T> {
    const loading = this.show({
      severity: 'info',
      summary: 'Loading',
      detail: '',
      sticky: true,
      ...(messages.loading ?? {}),
    });

    return promise.then(
      (value) => {
        this.remove(loading.id);
        const options =
          typeof messages.success === 'function' ? messages.success(value) : messages.success;
        this.show({ severity: 'success', summary: 'Success', ...(options ?? {}) });
        return value;
      },
      (error) => {
        this.remove(loading.id);
        const options =
          typeof messages.error === 'function' ? messages.error(error) : messages.error;
        this.show({ severity: 'error', summary: 'Error', ...(options ?? {}) });
        throw error;
      },
    );
  }

  pause(id: string): void {
    const timer = this.timers.get(id);
    if (!timer) {
      return;
    }
    clearTimeout(timer);
    this.timers.delete(id);
    const remainingMs = Math.max(0, (this.timerEndsAt.get(id) ?? Date.now()) - Date.now());
    this.remaining.set(id, remainingMs);
    this.timerEndsAt.delete(id);
  }

  resume(id: string): void {
    const toast = this.toastList().find((item) => item.id === id);
    const remainingMs = this.remaining.get(id);
    if (!toast || toast.sticky || remainingMs == null || remainingMs <= 0) {
      return;
    }
    this.remaining.delete(id);
    this.startTimer(id, remainingMs);
  }

  remove(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.timerEndsAt.delete(id);
    this.remaining.delete(id);
    this.toastList.update((items) => items.filter((toast) => toast.id !== id));
  }

  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.timerEndsAt.clear();
    this.remaining.clear();
    this.toastList.set([]);
  }

  runAction(toast: JToast, action: JToastAction): void {
    action.command(toast);
    this.remove(toast.id);
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
      neutral: 'Notification',
    };
    return titles[severity];
  }

  private startTimer(id: string, duration: number): void {
    // Don't schedule auto-dismiss timers during SSR — they would run server-side
    // and are pointless for a one-shot server render.
    if (!this.isBrowser) {
      return;
    }
    const timer = setTimeout(() => this.remove(id), duration);
    this.timers.set(id, timer);
    this.timerEndsAt.set(id, Date.now() + duration);
  }
}
