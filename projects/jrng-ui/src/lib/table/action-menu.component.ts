import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { JTableAction, JTableActionEvent, JTableRow } from './table.types';

@Component({
  selector: 'j-action-menu',
  imports: [],
  template: `
    <div class="j-action-menu" role="group" aria-label="Row actions">
      @for (action of normalizedActions; track action.key || action.label || $index) {
        <button
          type="button"
          class="j-action-menu__item"
          [class]="'j-action-menu__item j-action-menu__item--' + (action.severity || 'neutral')"
          [disabled]="action.disabled"
          (click)="activate(action, $event)"
        >
          @if (action.icon) {
            <span class="j-action-menu__icon" aria-hidden="true">{{ action.icon }}</span>
          }
          <span>{{ action.label }}</span>
        </button>
      }
    </div>
  `,
  styles: [
    `
      .j-action-menu {
        align-items: center;
        display: inline-flex;
        gap: var(--j-spacing-xs, 0.25rem);
      }

      .j-action-menu__item {
        align-items: center;
        background: var(--j-color-surface, #ffffff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-sm, 0.375rem);
        color: var(--j-color-text, #111827);
        cursor: pointer;
        display: inline-flex;
        font: inherit;
        font-size: var(--j-font-size-sm, 0.875rem);
        gap: var(--j-spacing-xs, 0.25rem);
        min-height: 2rem;
        padding: 0 var(--j-spacing-sm, 0.5rem);
      }

      .j-action-menu__item:hover:not(:disabled) {
        border-color: var(--j-color-primary, #4f46e5);
        color: var(--j-color-primary, #4f46e5);
      }

      .j-action-menu__item:focus-visible {
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
        outline: none;
      }

      .j-action-menu__item:disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity, 0.55);
      }

      .j-action-menu__item--danger {
        color: var(--j-color-danger, #dc2626);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JActionMenuComponent {
  @Input() actions: readonly JTableAction[] = [];
  @Input({ required: true }) row: JTableRow = {};
  @Input() rowIndex = 0;
  @Output() actionClick = new EventEmitter<JTableActionEvent>();

  get normalizedActions(): readonly JTableAction[] {
    return this.actions.length ? this.actions : [{ key: 'action', label: 'Actions' }];
  }

  activate(action: JTableAction, originalEvent: MouseEvent): void {
    if (action.disabled) {
      return;
    }

    const event: JTableActionEvent = {
      action,
      row: this.row,
      index: this.rowIndex,
      originalEvent,
    };
    action.command?.(event);
    this.actionClick.emit(event);
  }
}
