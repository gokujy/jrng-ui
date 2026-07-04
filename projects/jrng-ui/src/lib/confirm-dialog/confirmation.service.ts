import { Injectable, signal } from '@angular/core';
import { JSeverity } from '../core/types';

export interface JConfirmationOptions {
  readonly header?: string;
  readonly message?: string;
  readonly icon?: string;
  readonly severity?: JSeverity;
  readonly acceptLabel?: string;
  readonly rejectLabel?: string;
  readonly acceptButtonSeverity?: JSeverity;
  readonly rejectButtonSeverity?: JSeverity;
  readonly accept?: () => void;
  readonly reject?: () => void;
}

export interface JConfirmationRequest extends JConfirmationOptions {
  readonly id: string;
}

@Injectable({ providedIn: 'root' })
export class JConfirmationService {
  private readonly currentConfirmation = signal<JConfirmationRequest | null>(null);

  readonly confirmation = this.currentConfirmation.asReadonly();

  confirm(options: JConfirmationOptions): JConfirmationRequest {
    const request: JConfirmationRequest = {
      id: `j-confirm-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...options,
    };
    this.currentConfirmation.set(request);
    return request;
  }

  close(): void {
    this.currentConfirmation.set(null);
  }
}
