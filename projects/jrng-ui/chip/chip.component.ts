import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { JSeverity, JComponentSize, JStatusVariant } from 'jrng-ui/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JIconComponent } from 'jrng-ui/icon';

export type JChipVariant = Exclude<JStatusVariant, 'dot'>;

export interface JChipItem<T = unknown> {
  readonly label: string;
  readonly value?: T;
  readonly severity?: JSeverity;
  readonly icon?: string;
  readonly disabled?: boolean;
  readonly removable?: boolean;
}

@Component({
  selector: 'j-chip',
  imports: [JButtonComponent, JIconComponent],
  template: `
    <span
      [class]="chipClasses"
      [attr.data-j-severity]="severity()"
      [attr.aria-label]="ariaLabel() || label() || null"
      [attr.aria-disabled]="disabled() ? 'true' : null"
      data-jc-name="chip"
      data-jc-section="root"
      data-jc-extend="remove"
    >
      @if (icon()) {
        <j-icon [name]="icon()" aria-hidden="true" />
      }
      @if (image()) {
        <img class="j-chip__image" [src]="image()" [alt]="imageAlt()" />
      }
      <ng-content></ng-content>
      @if (label()) {
        <span data-jc-section="label">{{ label() }}</span>
      }
      @if (removable() && !disabled()) {
        <j-button
          class="j-chip__remove"
          data-jc-section="remove"
          variant="text"
          severity="neutral"
          actionDisplay="icon"
          [icon]="removeIcon()"
          [ariaLabel]="removeAriaLabel()"
          (keydown.backspace)="removeWithKeyboard($event)"
          (onClick)="remove.emit()"
        />
      }
    </span>
  `,
  styles: [
    `
      .j-chip {
        --j-chip-accent: var(--j-color-neutral);
        --j-chip-soft: var(--j-color-neutral-soft);
        --j-chip-foreground: var(--j-color-neutral-foreground);
        align-items: center;
        background: var(--j-chip-soft);
        border: 1px solid transparent;
        border-radius: var(--j-radius-full);
        color: var(--j-color-text);
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        gap: var(--j-spacing-xs);
        min-height: 1.75rem;
        padding: 0 var(--j-spacing-sm);
      }

      .j-chip--sm {
        font-size: var(--j-font-size-xs);
        min-height: 1.5rem;
      }

      .j-chip--xs {
        font-size: 0.6875rem;
        min-height: 1.25rem;
      }

      .j-chip--lg {
        min-height: 2rem;
      }

      .j-chip--xl {
        font-size: var(--j-font-size-base);
        min-height: 2.5rem;
        padding-inline: var(--j-spacing-3);
      }

      .j-chip__image {
        block-size: 1.5rem;
        border-radius: var(--j-radius-full);
        inline-size: 1.5rem;
        margin-inline-start: calc(var(--j-spacing-sm) * -1);
        object-fit: cover;
      }

      .j-chip--lg .j-chip__image,
      .j-chip--xl .j-chip__image {
        block-size: 1.75rem;
        inline-size: 1.75rem;
      }

      .j-chip--primary {
        --j-chip-accent: var(--j-color-primary);
        --j-chip-soft: var(--j-color-primary-soft);
        --j-chip-foreground: var(--j-color-primary-foreground);
      }
      .j-chip--secondary {
        --j-chip-accent: var(--j-color-secondary);
        --j-chip-soft: var(--j-color-secondary-soft);
        --j-chip-foreground: var(--j-color-secondary-foreground);
      }
      .j-chip--success {
        --j-chip-accent: var(--j-color-success);
        --j-chip-soft: var(--j-color-success-soft);
        --j-chip-foreground: var(--j-color-success-foreground);
      }
      .j-chip--info {
        --j-chip-accent: var(--j-color-info);
        --j-chip-soft: var(--j-color-info-soft);
        --j-chip-foreground: var(--j-color-info-foreground);
      }
      .j-chip--warning {
        --j-chip-accent: var(--j-color-warning);
        --j-chip-soft: var(--j-color-warning-soft);
        --j-chip-foreground: var(--j-color-warning-foreground);
      }
      .j-chip--danger {
        --j-chip-accent: var(--j-color-danger);
        --j-chip-soft: var(--j-color-danger-soft);
        --j-chip-foreground: var(--j-color-danger-foreground);
      }
      .j-chip--contrast {
        --j-chip-accent: var(--j-color-contrast);
        --j-chip-soft: var(--j-color-contrast-soft);
        --j-chip-foreground: var(--j-color-contrast-foreground);
      }

      .j-chip--soft {
        color: var(--j-chip-accent);
      }
      .j-chip--solid {
        background: var(--j-chip-accent);
        color: var(--j-chip-foreground);
      }
      .j-chip--outlined {
        background: transparent;
        border-color: var(--j-chip-accent);
        color: var(--j-chip-accent);
      }

      .j-chip.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-chip__remove {
        background: transparent;
        border: 0;
        color: inherit;
        cursor: pointer;
        font: inherit;
        padding: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JChipComponent {
  readonly label = input('');
  readonly severity = input<JSeverity>('neutral');
  readonly variant = input<JChipVariant>('soft');
  readonly size = input<JComponentSize>('md');
  readonly icon = input('');
  readonly image = input('');
  readonly imageAlt = input('');
  readonly ariaLabel = input('');
  readonly styleClass = input('');
  readonly removeAriaLabel = input('Remove');
  readonly removeIcon = input('close');
  readonly removable = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly remove = output<void>();

  protected removeWithKeyboard(event: Event): void {
    event.preventDefault();
    this.remove.emit();
  }

  get chipClasses(): string {
    return [
      'j-chip',
      `j-chip--${this.size()}`,
      `j-chip--${this.severity()}`,
      `j-chip--${this.variant()}`,
      this.disabled() ? 'is-disabled' : '',
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' ');
  }
}
