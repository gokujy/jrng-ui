import { ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';

/**
 * Shared JRNG overlay heading and close-action treatment.
 *
 * This component is infrastructure for JRNG overlays rather than a documented
 * application-facing component. Keeping it in its own entry point avoids a
 * core -> button dependency cycle while allowing overlay entry points to share
 * the exact same accessible action implementation.
 */
@Component({
  selector: 'j-overlay-header',
  standalone: true,
  imports: [JButtonComponent],
  template: `
    <header
      class="j-overlay-header"
      [class.j-overlay-header--dense]="dense()"
      [class.j-overlay-header--draggable]="draggable()"
      data-jc-section="header"
    >
      <div class="j-overlay-header__heading" data-jc-section="heading">
        @if (title()) {
          <h2 class="j-overlay-header__title" data-jc-section="title" [id]="titleId() || null">
            {{ title() }}
          </h2>
        }
        @if (subtitle()) {
          <div class="j-overlay-header__subtitle" data-jc-section="subtitle">
            {{ subtitle() }}
          </div>
        }
        <ng-content select="[jOverlayHeader]"></ng-content>
      </div>

      <div class="j-overlay-header__actions" data-jc-section="actions">
        <ng-content select="[jOverlayActions]"></ng-content>
        @if (closable()) {
          <j-button
            #closeButton
            styleClass="j-overlay-header__close"
            data-jc-section="close"
            actionDisplay="icon"
            variant="text"
            icon="close"
            [styleClass]="closeStyleClass()"
            [ariaLabel]="closeLabel()"
            [title]="closeTooltip() || closeLabel()"
            (onClick)="close.emit()"
          />
        }
      </div>
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }

      .j-overlay-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--j-spacing-md, 1rem);
        min-height: 3.5rem;
        padding: var(--j-spacing-3, 0.75rem) var(--j-spacing-4, 1rem);
        border-bottom: 1px solid var(--j-color-border, #d9e0e8);
        background: var(--j-color-surface, #fff);
        color: var(--j-color-text, #172033);
      }

      .j-overlay-header--dense {
        min-height: 3rem;
        padding-block: var(--j-spacing-2, 0.5rem);
      }

      .j-overlay-header--draggable {
        cursor: grab;
        user-select: none;
      }

      .j-overlay-header__heading {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        gap: var(--j-spacing-1, 0.25rem);
        min-width: 0;
      }

      .j-overlay-header__title {
        margin: 0;
        overflow: hidden;
        font-size: var(--j-font-size-md, 1rem);
        font-weight: var(--j-font-weight-semibold, 600);
        line-height: 1.35;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .j-overlay-header__subtitle {
        overflow: hidden;
        color: var(--j-color-text-muted, #64748b);
        font-size: var(--j-font-size-sm, 0.875rem);
        line-height: 1.35;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .j-overlay-header__actions {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        gap: var(--j-spacing-1, 0.25rem);
        margin-inline-start: auto;
      }

      @media (max-width: 36rem) {
        .j-overlay-header {
          align-items: flex-start;
          padding-inline: var(--j-spacing-3, 0.75rem);
        }

        .j-overlay-header__subtitle {
          white-space: normal;
        }
      }

      @media (forced-colors: active) {
        .j-overlay-header {
          border-color: CanvasText;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JInternalOverlayHeaderComponent {
  private readonly closeButton = viewChild<JButtonComponent>('closeButton');
  readonly title = input('');
  readonly titleId = input('');
  readonly subtitle = input('');
  readonly closable = input(true);
  readonly dense = input(false);
  readonly draggable = input(false);
  readonly closeLabel = input('Close');
  readonly closeTooltip = input('');
  readonly closeStyleClass = input('');
  readonly close = output<void>();

  /** Focuses the close action when it is rendered. */
  focusClose(options?: FocusOptions): void {
    this.closeButton()?.focus(options);
  }
}
