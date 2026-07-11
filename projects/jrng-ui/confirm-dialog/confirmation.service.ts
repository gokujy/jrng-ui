import { Injectable, signal } from '@angular/core';
import { JSeverity, jCreateId } from 'jrng-ui/core';

export interface JConfirmationOptions {
  readonly title?: string;
  readonly header?: string;
  readonly message?: string;
  readonly icon?: string;
  readonly severity?: JSeverity;
  readonly confirmText?: string;
  readonly cancelText?: string;
  readonly acceptLabel?: string;
  readonly rejectLabel?: string;
  readonly acceptButtonSeverity?: JSeverity;
  readonly rejectButtonSeverity?: JSeverity;
  readonly closeOnOverlayClick?: boolean;
  readonly closeOnEscape?: boolean;
  readonly target?: HTMLElement | null;
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
      id: jCreateId('j-confirm'),
      ...options,
    };
    this.currentConfirmation.set(request);
    return request;
  }

  delete(options: Omit<JConfirmationOptions, 'severity'> = {}): JConfirmationRequest {
    return this.confirm({
      title: 'Delete item',
      message: 'This action cannot be undone.',
      confirmText: 'Delete',
      severity: 'danger',
      ...options,
    });
  }

  approve(options: Omit<JConfirmationOptions, 'severity'> = {}): JConfirmationRequest {
    return this.confirm({
      title: 'Approve item',
      message: 'Approve this item and continue.',
      confirmText: 'Approve',
      severity: 'success',
      ...options,
    });
  }

  reject(options: Omit<JConfirmationOptions, 'severity'> = {}): JConfirmationRequest {
    return this.confirm({
      title: 'Reject item',
      message: 'Reject this item and notify the user.',
      confirmText: 'Reject',
      severity: 'warning',
      ...options,
    });
  }

  logout(options: Omit<JConfirmationOptions, 'severity'> = {}): JConfirmationRequest {
    return this.confirm({
      title: 'Log out',
      message: 'You will need to sign in again to continue.',
      confirmText: 'Log out',
      severity: 'info',
      ...options,
    });
  }

  unsavedChanges(options: Omit<JConfirmationOptions, 'severity'> = {}): JConfirmationRequest {
    return this.confirm({
      title: 'Discard unsaved changes?',
      message: 'Changes you made may not be saved.',
      confirmText: 'Discard',
      cancelText: 'Keep editing',
      severity: 'warning',
      ...options,
    });
  }

  close(): void {
    this.currentConfirmation.set(null);
  }
}
