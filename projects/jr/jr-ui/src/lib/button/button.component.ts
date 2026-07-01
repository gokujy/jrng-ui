import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type JrButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type JrButtonSize = 'sm' | 'md' | 'lg';
export type JrButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'jr-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JrButtonComponent {
  @Input() variant: JrButtonVariant = 'primary';
  @Input() size: JrButtonSize = 'md';
  @Input() type: JrButtonType = 'button';
  @Input() iconBefore = '';
  @Input() iconAfter = '';
  @Input() ariaLabel = '';
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) loading = false;
  @Input({ transform: booleanAttribute }) fullWidth = false;

  @Output() jrPress = new EventEmitter<MouseEvent>();

  get isBlocked(): boolean {
    return this.disabled || this.loading;
  }

  handleClick(event: MouseEvent): void {
    if (this.isBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    this.jrPress.emit(event);
  }
}
