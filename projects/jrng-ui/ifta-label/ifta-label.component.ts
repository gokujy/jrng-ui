import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';

@Component({
  selector: 'j-ifta-label',
  imports: [],
  template: `
    <div
      [class]="labelClasses()"
      data-jc-name="ifta-label"
      data-jc-section="root"
      [attr.data-j-focused]="focused() ? 'true' : null"
      [attr.data-j-active]="filled() ? 'true' : null"
      [attr.data-j-disabled]="disabled() ? 'true' : null"
      [attr.data-j-invalid]="invalid() ? 'true' : null"
    >
      <span class="j-ifta-label__text" data-jc-section="label">{{ label() }}</span>
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .j-ifta-label {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-input-radius);
        display: inline-grid;
        gap: var(--j-spacing-xs);
        padding: var(--j-spacing-xs) var(--j-spacing-md) var(--j-spacing-sm);
        transition: var(--j-transition-colors), var(--j-transition-shadow);
      }

      .j-ifta-label--fluid {
        width: 100%;
      }

      .j-ifta-label:focus-within,
      .j-ifta-label.is-focused {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-ifta-label.is-invalid {
        border-color: var(--j-color-danger);
      }

      .j-ifta-label.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-ifta-label__text {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JIftaLabelComponent {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly label = input('');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });

  readonly focused = signal(false);
  readonly filled = signal(false);

  readonly labelClasses = computed(() =>
    jMergePartClasses(
      [
        'j-ifta-label',
        this.focused() ? 'is-focused' : '',
        this.filled() ? 'is-filled' : '',
        this.disabled() ? 'is-disabled' : '',
        this.invalid() ? 'is-invalid' : '',
        this.fullWidth() ? 'j-ifta-label--fluid' : '',
      ],
      this.styleClass(),
      this.pt(),
    ),
  );

  @HostListener('focusin')
  handleFocusIn(): void {
    this.focused.set(true);
    this.syncFilled();
  }

  @HostListener('focusout')
  handleFocusOut(): void {
    this.focused.set(false);
    this.syncFilled();
  }

  @HostListener('input')
  handleInput(): void {
    this.syncFilled();
  }

  private syncFilled(): void {
    const control = this.elementRef.nativeElement.querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >('input, textarea, select');
    this.filled.set(!!control?.value);
  }
}
