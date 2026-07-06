import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'j-toolbar',
  template: `
    <div class="j-toolbar" role="toolbar">
      <div class="j-toolbar__start">
        <ng-content select="[jToolbarStart]"></ng-content>
      </div>
      <div class="j-toolbar__center">
        <ng-content></ng-content>
      </div>
      <div class="j-toolbar__end">
        <ng-content select="[jToolbarEnd]"></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .j-toolbar {
        align-items: center;
        background: var(--j-color-surface, #ffffff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-md, 0.5rem);
        display: flex;
        gap: var(--j-spacing-md, 0.75rem);
        justify-content: space-between;
        min-height: 3.25rem;
        padding: var(--j-spacing-sm, 0.5rem) var(--j-spacing-lg, 1rem);
      }

      .j-toolbar__start,
      .j-toolbar__center,
      .j-toolbar__end {
        align-items: center;
        display: inline-flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-sm, 0.5rem);
      }

      .j-toolbar__center {
        flex: 1 1 auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JToolbarComponent {}
