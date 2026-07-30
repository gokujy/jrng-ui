import {
  booleanAttribute,
  ChangeDetectionStrategy,
  computed,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { JRippleDirective } from 'jrng-ui/core';
import { JIconComponent } from 'jrng-ui/icon';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import {
  JActionDisplay,
  JActionVariant,
  JComponentSize,
  JComponentWidth,
  JSeverity,
  JShape,
} from 'jrng-ui/core';

export type JButtonType = 'button' | 'submit' | 'reset';
export type JButtonIconPosition = 'left' | 'right';
export type JButtonVariant = JActionVariant;
export type JButtonSeverity = JSeverity;
export type JButtonSize = JComponentSize;
export type JButtonProgressState = 'idle' | 'running' | 'success' | 'error' | 'cancelled';

@Component({
  selector: 'j-button',
  imports: [JRippleDirective, JIconComponent, JTooltipDirective],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JButtonComponent {
  private readonly buttonElement = viewChild.required<ElementRef<HTMLButtonElement>>('button');
  readonly label = input('');
  readonly type = input<JButtonType>('button');
  readonly severity = input<JButtonSeverity>('primary');
  readonly variant = input<JButtonVariant>('solid');
  readonly size = input<JButtonSize>('md');
  readonly icon = input('');
  readonly iconPosition = input<JButtonIconPosition>('left');
  readonly styleClass = input('');
  readonly ariaLabel = input('');
  readonly ariaExpanded = input<boolean | null>(null);
  readonly ariaControls = input<string | null>(null);
  readonly ariaPressed = input<boolean | null>(null);
  readonly ariaChecked = input<boolean | null>(null);
  readonly ariaRole = input('');
  readonly ariaHasPopup = input<'menu' | 'dialog' | 'listbox' | 'tree' | 'grid' | 'true' | ''>('');
  readonly title = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly shape = input<JShape>('rounded');
  readonly width = input<JComponentWidth>('auto');
  readonly actionDisplay = input<JActionDisplay>('icon-label');
  readonly ripple = input(true, { transform: booleanAttribute });
  readonly badge = input<string | number | null>(null);
  readonly badgeAriaLabel = input('');
  readonly loadingLabel = input('Loading');
  readonly tabindex = input<number | null>(null);
  readonly progress = input<number | null>(null);
  readonly progressLabel = input(false, { transform: booleanAttribute });
  readonly progressState = input<JButtonProgressState>('idle');
  readonly cancelable = input(false, { transform: booleanAttribute });
  readonly blockWhileRunning = input(true, { transform: booleanAttribute });

  readonly onClick = output<MouseEvent>();
  readonly cancel = output<MouseEvent>();

  readonly normalizedProgress = computed(() => {
    const value = this.progress();
    return value === null || !Number.isFinite(value) ? null : Math.max(0, Math.min(100, value));
  });
  readonly isProgressRunning = computed(() => this.progressState() === 'running');
  readonly isBlocked = computed(
    () =>
      this.disabled() ||
      this.loading() ||
      (this.isProgressRunning() && this.blockWhileRunning() && !this.cancelable()),
  );

  readonly buttonClasses = computed(() =>
    jMergePartClasses(
      [
        'j-button',
        `j-button--${this.severity()}`,
        `j-button--${this.variant()}`,
        `j-button--${this.size()}`,
        `j-button--shape-${this.shape()}`,
        this.width() === 'full' ? 'j-button--full' : '',
        this.actionDisplay() === 'icon' ? 'j-button--icon-only' : '',
        this.loading() ? 'is-loading' : '',
        this.normalizedProgress() !== null ? 'j-button--progress' : '',
        `j-button--progress-${this.progressState()}`,
      ],
      this.styleClass(),
      this.pt(),
    ),
  );

  handleClick(event: MouseEvent): void {
    if (this.isProgressRunning() && this.cancelable() && !this.disabled() && !this.loading()) {
      this.cancel.emit(event);
      return;
    }
    if (this.isBlocked()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    this.onClick.emit(event);
  }

  /** Moves focus to the underlying native button. */
  focus(options?: FocusOptions): void {
    this.buttonElement().nativeElement.focus(options);
  }
}
