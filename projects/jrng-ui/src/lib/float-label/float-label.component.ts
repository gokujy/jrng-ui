import {
  booleanAttribute,
  AfterViewInit,
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
  selector: 'j-float-label',
  imports: [],
  template: `
    <span
      [class]="labelClasses()"
      data-jc-name="float-label"
      data-jc-section="root"
      [attr.data-j-focused]="focused() ? 'true' : null"
      [attr.data-j-active]="filled() ? 'true' : null"
      [attr.data-j-disabled]="disabled() ? 'true' : null"
      [attr.data-j-invalid]="invalid() ? 'true' : null"
    >
      <ng-content></ng-content>
      <span class="j-float-label__label" data-jc-section="label">{{ label() }}</span>
    </span>
  `,
  styles: [
    `
      .j-float-label {
        display: inline-block;
        position: relative;
      }

      .j-float-label--fluid {
        width: 100%;
      }

      .j-float-label__label {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-sm);
        left: var(--j-spacing-md);
        pointer-events: none;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        transition:
          var(--j-transition-colors),
          transform var(--j-duration-fast) var(--j-ease-standard);
      }

      .j-float-label.is-filled .j-float-label__label,
      .j-float-label.is-focused .j-float-label__label {
        background: var(--j-color-background);
        color: var(--j-color-primary);
        padding-inline: var(--j-spacing-xs);
        transform: translateY(-2.05rem) scale(0.86);
      }

      .j-float-label.is-invalid .j-float-label__label {
        color: var(--j-color-danger);
      }

      .j-float-label.is-disabled {
        opacity: var(--j-disabled-opacity);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JFloatLabelComponent implements AfterViewInit {
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
        'j-float-label',
        this.focused() ? 'is-focused' : '',
        this.filled() ? 'is-filled' : '',
        this.disabled() ? 'is-disabled' : '',
        this.invalid() ? 'is-invalid' : '',
        this.fullWidth() ? 'j-float-label--fluid' : '',
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

  ngAfterViewInit(): void {
    queueMicrotask(() => this.syncFilled());
  }

  private syncFilled(): void {
    const control = this.elementRef.nativeElement.querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >('input, textarea, select');
    this.filled.set(!!control?.value);
  }
}
