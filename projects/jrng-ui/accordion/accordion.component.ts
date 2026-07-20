import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  OnChanges,
  QueryList,
  SimpleChanges,
  booleanAttribute,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';

export type JAccordionActiveIndex = number | readonly number[] | null;
export type JAccordionVariant = 'default' | 'separated' | 'minimal';

/** Projected header primitive for the compositional accordion API. */
@Component({
  selector: 'j-accordion-header',
  template: `<ng-content />`,
  host: { class: 'j-accordion-header' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JAccordionHeaderComponent {}

/** Projected content primitive for the compositional accordion API. */
@Component({
  selector: 'j-accordion-content',
  template: `<ng-content />`,
  host: { class: 'j-accordion-content' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JAccordionContentComponent {}

@Component({
  selector: 'j-accordion-panel',
  imports: [],
  template: `
    <section
      class="j-accordion-panel"
      [class.j-accordion-panel--separated]="presentation() === 'separated'"
      [class.j-accordion-panel--minimal]="presentation() === 'minimal'"
      [class.is-active]="active"
      [class.is-disabled]="disabled()"
      data-jc-name="accordion"
      data-jc-section="panel"
      [attr.data-j-active]="active ? 'true' : null"
      [attr.data-j-disabled]="disabled() ? 'true' : null"
    >
      <h3 class="j-accordion-panel__header">
        <button
          type="button"
          class="j-accordion-panel__button"
          [disabled]="disabled()"
          [attr.aria-expanded]="active"
          (click)="requestToggle()"
        >
          <span class="j-accordion-panel__header-content">
            @if (header()) {
              {{ header() }}
            }
            <ng-content select="j-accordion-header"></ng-content>
          </span>
          <span aria-hidden="true">{{ active ? '−' : '+' }}</span>
        </button>
      </h3>
      <div class="j-accordion-panel__content" [hidden]="!active">
        <ng-content select="j-accordion-content"></ng-content>
        <ng-content></ng-content>
      </div>
    </section>
  `,
  styles: [
    `
      .j-accordion-panel {
        border-bottom: 1px solid var(--j-color-border, #dbe2ea);
      }

      .j-accordion-panel:last-child {
        border-bottom: 0;
      }

      .j-accordion-panel__header {
        margin: 0;
      }

      .j-accordion-panel__button {
        align-items: center;
        background: var(--j-color-surface, #ffffff);
        border: 0;
        color: var(--j-color-text, #111827);
        cursor: pointer;
        display: flex;
        font: inherit;
        font-weight: var(--j-font-weight-semibold, 650);
        justify-content: space-between;
        min-height: 3.5rem;
        padding: 0 var(--j-spacing-4, 1rem);
        text-align: left;
        width: 100%;
      }

      .j-accordion-panel__button:hover:not(:disabled),
      .j-accordion-panel.is-active .j-accordion-panel__button {
        background: var(--j-color-muted, #f8fafc);
        color: var(--j-color-primary, #4f46e5);
      }

      .j-accordion-panel__button:focus-visible {
        box-shadow: inset var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
        outline: none;
      }

      .j-accordion-panel__button:disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity, 0.55);
      }

      .j-accordion-panel__content {
        background: var(--j-color-card, #ffffff);
        border-top: 1px solid var(--j-color-border, #dbe2ea);
        color: var(--j-color-muted-foreground, #64748b);
        line-height: 1.6;
        padding: var(--j-spacing-4, 1rem);
      }

      .j-accordion-panel--separated {
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-lg, 0.75rem);
        overflow: hidden;
      }

      .j-accordion-panel--minimal {
        border-bottom-style: dashed;
      }

      .j-accordion-panel--minimal .j-accordion-panel__button,
      .j-accordion-panel--minimal .j-accordion-panel__content {
        background: transparent;
        padding-inline: 0;
      }

      .j-accordion-panel--minimal .j-accordion-panel__content {
        border-top: 0;
        padding-top: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JAccordionPanelComponent {
  readonly header = input('');
  readonly value = input<string | number | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly toggleRequest = output<JAccordionPanelComponent>();

  index = -1;
  active = false;
  /** Presentation inherited from the owning accordion. */
  readonly presentation = signal<JAccordionVariant>('default');

  requestToggle(): void {
    if (!this.disabled()) {
      this.toggleRequest.emit(this);
    }
  }
}

@Component({
  selector: 'j-accordion',
  imports: [],
  template: `<div
    [class]="'j-accordion j-accordion--' + variant()"
    [attr.data-j-variant]="variant()"
    data-jc-name="accordion"
    data-jc-section="root"
  >
    <ng-content></ng-content>
  </div>`,
  styles: [
    `
      .j-accordion {
        background: var(--j-color-surface, #ffffff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-lg, 0.75rem);
        box-shadow: var(--j-shadow-sm);
        color: var(--j-color-text, #111827);
        overflow: hidden;
      }

      .j-accordion--separated {
        background: transparent;
        border: 0;
        border-radius: 0;
        box-shadow: none;
        display: grid;
        gap: var(--j-spacing-sm, 0.5rem);
        overflow: visible;
      }

      .j-accordion--minimal {
        background: transparent;
        border: 0;
        border-radius: 0;
        box-shadow: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JAccordionComponent implements AfterContentInit, OnChanges {
  private readonly changeDetector = inject(ChangeDetectorRef);

  @ContentChildren(JAccordionPanelComponent) panels?: QueryList<JAccordionPanelComponent>;
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly activeIndex = model<JAccordionActiveIndex>(null);
  /** Value-based controlled state for stable dynamic collections. */
  readonly value = model<string | number | readonly (string | number)[] | null>(null);
  readonly variant = input<JAccordionVariant>('default');

  ngAfterContentInit(): void {
    this.syncPanels();
    this.bindPanels();
    this.panels?.changes.subscribe(() => {
      this.syncPanels();
      this.bindPanels();
      this.changeDetector.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeIndex'] || changes['value'] || changes['multiple'] || changes['variant']) {
      this.syncPanels();
    }
  }

  togglePanel(panel: JAccordionPanelComponent): void {
    if (panel.disabled()) {
      return;
    }

    const currentIndexes = this.currentActiveIndexes();

    if (this.multiple()) {
      const next = currentIndexes.includes(panel.index)
        ? currentIndexes.filter((index) => index !== panel.index)
        : [...currentIndexes, panel.index];
      this.activeIndex.set(next);
      this.value.set(
        next.map((index) => {
          const candidate = this.panels?.get(index);
          return candidate ? this.panelValue(candidate) : index;
        }),
      );
    } else {
      const next = currentIndexes.includes(panel.index) ? null : panel.index;
      this.activeIndex.set(next);
      this.value.set(next === null ? null : this.panelValue(panel));
    }

    this.syncPanels();
  }

  private syncPanels(): void {
    this.panels?.forEach((panel, index) => {
      panel.index = index;
    });
    const activeIndexes = this.currentActiveIndexes();
    this.panels?.forEach((panel, index) => {
      panel.active = activeIndexes.includes(index);
      panel.presentation.set(this.variant());
    });
  }

  private bindPanels(): void {
    this.panels?.forEach((panel) => {
      panel.toggleRequest.subscribe((target) => this.togglePanel(target));
    });
  }

  private activeIndexes(): readonly number[] {
    const current = this.activeIndex();

    if (Array.isArray(current)) {
      return current;
    }

    return typeof current === 'number' ? [current] : [];
  }

  private currentActiveIndexes(): readonly number[] {
    const controlled = this.value();
    if (controlled === null) {
      return this.activeIndexes();
    }

    const values: readonly (string | number)[] = Array.isArray(controlled)
      ? controlled
      : [controlled];
    return (this.panels?.toArray() ?? [])
      .filter((panel) => values.includes(this.panelValue(panel)))
      .map((panel) => panel.index);
  }

  private panelValue(panel: JAccordionPanelComponent): string | number {
    return panel.value() ?? panel.index;
  }
}
