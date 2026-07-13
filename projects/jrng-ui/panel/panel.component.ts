import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  linkedSignal,
  output,
} from '@angular/core';

@Component({
  selector: 'j-panel',
  imports: [],
  template: `
    <section class="j-panel" [class.is-collapsed]="collapsedState()">
      @if (header() || toggleable()) {
        <header class="j-panel__header">
          @if (header()) {
            <h3>{{ header() }}</h3>
          }
          @if (toggleable()) {
            <button
              type="button"
              class="j-panel__toggle"
              [attr.aria-expanded]="!collapsedState()"
              (click)="toggle()"
            >
              {{ collapsedState() ? 'Expand' : 'Collapse' }}
            </button>
          }
        </header>
      }
      <div class="j-panel__body" [hidden]="collapsedState()">
        <ng-content></ng-content>
      </div>
    </section>
  `,
  styles: [
    `
      .j-panel {
        background: var(--j-color-surface, #ffffff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-md, 0.5rem);
        color: var(--j-color-text, #111827);
        overflow: hidden;
      }

      .j-panel__header {
        align-items: center;
        background: var(--j-color-surface-muted, #f8fafc);
        border-bottom: 1px solid var(--j-color-border, #dbe2ea);
        display: flex;
        justify-content: space-between;
        min-height: 3rem;
        padding: 0 var(--j-spacing-lg, 1rem);
      }

      .j-panel__header h3 {
        font-size: var(--j-font-size-md, 1rem);
        margin: 0;
      }

      .j-panel__body {
        padding: var(--j-spacing-lg, 1rem);
      }

      .j-panel__toggle {
        background: transparent;
        border: 0;
        color: var(--j-color-primary, #4f46e5);
        cursor: pointer;
        font: inherit;
      }

      .j-panel__toggle:focus-visible {
        border-radius: var(--j-radius-sm, 0.375rem);
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
        outline: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JPanelComponent {
  readonly header = input('');
  readonly toggleable = input(false, { transform: booleanAttribute });
  readonly collapsed = input(false, { transform: booleanAttribute });
  readonly collapsedChange = output<boolean>();

  protected readonly collapsedState = linkedSignal(() => this.collapsed());

  toggle(): void {
    this.collapsedState.set(!this.collapsedState());
    this.collapsedChange.emit(this.collapsedState());
  }
}
