import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { JSeverity, JSize, JVariant } from '../core/types';

export type JButtonType = 'button' | 'submit' | 'reset';
export type JButtonIconPosition = 'left' | 'right';
export type JButtonVariant = JVariant;
export type JButtonSeverity = JSeverity;
export type JButtonSize = JSize;
export type JrButtonVariant = JButtonVariant | JButtonSeverity | 'outline' | 'ghost';
export type JrButtonSize = JButtonSize;
export type JrButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'j-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JrButtonComponent {
  @Input() label = '';
  @Input() type: JButtonType = 'button';
  @Input() severity: JButtonSeverity = 'primary';
  @Input() variant: JButtonVariant | JrButtonVariant = 'filled';
  @Input() size: JButtonSize = 'md';
  @Input() icon = '';
  @Input() iconPosition: JButtonIconPosition = 'left';
  @Input() styleClass = '';
  @Input() ariaLabel = '';
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) loading = false;
  @Input({ transform: booleanAttribute }) rounded = false;
  @Input({ transform: booleanAttribute }) outlined = false;
  @Input({ transform: booleanAttribute }) text = false;
  @Input({ transform: booleanAttribute }) raised = false;

  @Output() clicked = new EventEmitter<MouseEvent>();
  @Output() jrPress = new EventEmitter<MouseEvent>();

  get isBlocked(): boolean {
    return this.disabled || this.loading;
  }

  get resolvedSeverity(): JButtonSeverity {
    const legacySeverity = this.variant;

    if (
      legacySeverity === 'primary' ||
      legacySeverity === 'secondary' ||
      legacySeverity === 'success' ||
      legacySeverity === 'warning' ||
      legacySeverity === 'danger' ||
      legacySeverity === 'info' ||
      legacySeverity === 'neutral'
    ) {
      return legacySeverity;
    }

    return this.severity;
  }

  get resolvedVariant(): JButtonVariant {
    if (this.text || this.variant === 'text' || this.variant === 'ghost') {
      return 'text';
    }

    if (this.outlined || this.variant === 'outlined' || this.variant === 'outline') {
      return 'outlined';
    }

    return 'filled';
  }

  get buttonClasses(): string {
    return [
      'j-button',
      `j-button--${this.resolvedSeverity}`,
      `j-button--${this.resolvedVariant}`,
      `j-button--${this.size}`,
      this.rounded ? 'j-button--rounded' : '',
      this.raised ? 'j-button--raised' : '',
      this.loading ? 'is-loading' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (this.isBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    this.clicked.emit(event);
    this.jrPress.emit(event);
  }
}
