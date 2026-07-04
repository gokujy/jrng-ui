import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  booleanAttribute,
} from '@angular/core';

@Component({
  selector: 'j-fieldset',
  imports: [],
  template: `
    <fieldset class="j-fieldset" [class.is-collapsed]="collapsed">
      @if (legend) {
        <legend class="j-fieldset__legend">
          @if (toggleable) {
            <button
              type="button"
              class="j-fieldset__toggle"
              [attr.aria-expanded]="!collapsed"
              (click)="toggle()"
            >
              <span class="j-fieldset__icon" aria-hidden="true">{{ collapsed ? '+' : '−' }}</span>
              <span>{{ legend }}</span>
            </button>
          } @else {
            {{ legend }}
          }
        </legend>
      }
      <div class="j-fieldset__content" [hidden]="collapsed">
        <ng-content></ng-content>
      </div>
    </fieldset>
  `,
  styles: [
    `
      .j-fieldset {
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-md, 0.5rem);
        padding: var(--j-spacing-lg, 1rem);
      }

      .j-fieldset__legend {
        color: var(--j-color-text, #111827);
        font-weight: var(--j-font-weight-semibold, 650);
        padding: 0 var(--j-spacing-sm, 0.5rem);
      }

      .j-fieldset__toggle {
        align-items: center;
        background: transparent;
        border: 0;
        color: inherit;
        cursor: pointer;
        display: inline-flex;
        font: inherit;
        gap: var(--j-spacing-sm, 0.5rem);
        padding: 0;
      }

      .j-fieldset__toggle:focus-visible {
        border-radius: var(--j-radius-sm, 0.375rem);
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
        outline: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JFieldsetComponent {
  @Input() legend = '';
  @Input({ transform: booleanAttribute }) toggleable = false;
  @Input({ transform: booleanAttribute }) collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  toggle(): void {
    if (!this.toggleable) {
      return;
    }

    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
