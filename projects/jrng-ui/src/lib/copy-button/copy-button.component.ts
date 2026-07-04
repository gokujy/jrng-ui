import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'j-copy-button',
  imports: [],
  template: `
    <button type="button" class="j-copy-button" [attr.aria-label]="ariaLabel" (click)="copy()">
      <span aria-hidden="true">{{ copiedState ? '✓' : '⧉' }}</span>
      <span>{{ copiedState ? copiedLabel : label }}</span>
    </button>
  `,
  styles: [
    `
      .j-copy-button {
        align-items: center;
        background: var(--j-color-surface, #ffffff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-sm, 0.375rem);
        color: var(--j-color-text, #111827);
        cursor: pointer;
        display: inline-flex;
        font: inherit;
        gap: var(--j-spacing-sm, 0.5rem);
        min-height: 2.25rem;
        padding: 0 var(--j-spacing-md, 0.75rem);
      }

      .j-copy-button:focus-visible {
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
        outline: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JCopyButtonComponent {
  @Input() text = '';
  @Input() label = 'Copy';
  @Input() copiedLabel = 'Copied';
  @Input() ariaLabel = 'Copy to clipboard';
  @Output() copied = new EventEmitter<string>();

  copiedState = false;

  async copy(): Promise<void> {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(this.text);
    }

    this.copiedState = true;
    this.copied.emit(this.text);
    window.setTimeout(() => {
      this.copiedState = false;
    }, 1600);
  }
}
