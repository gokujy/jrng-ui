import { Injectable, signal } from '@angular/core';
import { JDialogSize } from './dialog.component';

export interface JDialogRequest {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly size: JDialogSize;
}

export interface JDialogOpenOptions {
  readonly title?: string;
  readonly message?: string;
  readonly size?: JDialogSize;
}

@Injectable({ providedIn: 'root' })
export class JDialogService {
  private readonly activeDialog = signal<JDialogRequest | null>(null);

  readonly dialog = this.activeDialog.asReadonly();

  open(options: JDialogOpenOptions): JDialogRequest {
    const request: JDialogRequest = {
      id: `j-dialog-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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
