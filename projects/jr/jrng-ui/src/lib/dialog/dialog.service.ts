import { Injectable, signal } from '@angular/core';

export type JrDialogSize = 'sm' | 'md' | 'lg' | 'xl';

export interface JrDialogRequest {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly size: JrDialogSize;
}

export interface JrDialogOpenOptions {
  readonly title?: string;
  readonly message?: string;
  readonly size?: JrDialogSize;
}

@Injectable({ providedIn: 'root' })
export class JrDialogService {
  private readonly activeDialog = signal<JrDialogRequest | null>(null);

  readonly dialog = this.activeDialog.asReadonly();

  open(options: JrDialogOpenOptions): JrDialogRequest {
    const request: JrDialogRequest = {
      id: `jr-dialog-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: options.title ?? '',
      message: options.message ?? '',
      size: options.size ?? 'md',
    };

    this.activeDialog.set(request);
    return request;
  }

  close(): void {
    this.activeDialog.set(null);
  }
}
