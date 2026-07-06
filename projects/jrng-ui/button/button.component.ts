import {
  booleanAttribute,
  ChangeDetectionStrategy,
  computed,
  Component,
  input,
  output,
} from '@angular/core';
import { JRippleDirective } from 'jrng-ui/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import { JSeverity } from 'jrng-ui/core';

export type JButtonType = 'button' | 'submit' | 'reset';
export type JButtonIconPosition = 'left' | 'right';
export type JButtonVariant = 'filled' | 'outline' | 'outlined' | 'ghost' | 'soft' | 'link' | 'text';
export type JButtonSeverity = JSeverity;
export type JButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export type JrButtonVariant = JButtonVariant | JButtonSeverity;
export type JrButtonSize = JButtonSize;
export type JrButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'j-button',
  imports: [JRippleDirective],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JrButtonComponent {
  readonly label = input('');
  readonly type = input<JButtonType>('button');
  readonly severity = input<JButtonSeverity>('primary');
  readonly variant = input<JButtonVariant | JrButtonVariant>('filled');
  readonly size = input<JButtonSize>('md');
  readonly icon = input('');
  readonly iconPosition = input<JButtonIconPosition>('left');
  readonly styleClass = input('');
  readonly ariaLabel = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly rounded = input(false, { transform: booleanAttribute });
  readonly outlined = input(false, { transform: booleanAttribute });
  readonly text = input(false, { transform: booleanAttribute });
  readonly raised = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly iconOnly = input(false, { transform: booleanAttribute });

  readonly onClick = output<MouseEvent>();

  readonly isBlocked = computed(() => this.disabled() || this.loading());

  readonly resolvedSeverity = computed<JButtonSeverity>(() => {
    const legacySeverity = this.variant();
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

    return this.severity();
  });

  readonly resolvedVariant = computed<JButtonVariant>(() => {
    const variant = this.variant();

    if (this.text() || variant === 'text') {
      return 'link';
    }

    if (variant === 'ghost' || variant === 'soft' || variant === 'link') {
      return variant;
    }

    if (this.outlined() || variant === 'outlined' || variant === 'outline') {
      return 'outline';
    }

    return 'filled';
  });

  readonly buttonClasses = computed(() =>
    jMergePartClasses(
      [
        'j-button',
        `j-button--${this.resolvedSeverity()}`,
        `j-button--${this.resolvedVariant()}`,
        `j-button--${this.size()}`,
        this.rounded() ? 'j-button--rounded' : '',
        this.raised() ? 'j-button--raised' : '',
        this.fullWidth() ? 'j-button--full' : '',
        this.iconOnly() ? 'j-button--icon-only' : '',
        this.loading() ? 'is-loading' : '',
      ],
      this.styleClass(),
      this.pt(),
    ),
  );

  handleClick(event: MouseEvent): void {
    if (this.isBlocked()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    this.onClick.emit(event);
  }
}
