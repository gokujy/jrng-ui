import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  booleanAttribute,
  inject,
} from '@angular/core';

export type JAccordionActiveIndex = number | readonly number[] | null;

@Component({
  selector: 'j-accordion-panel',
  imports: [],
  template: `
    <section class="j-accordion-panel" [class.is-active]="active" [class.is-disabled]="disabled">
      <h3 class="j-accordion-panel__header">
        <button
          type="button"
          class="j-accordion-panel__button"
          [disabled]="disabled"
          [attr.aria-expanded]="active"
          (click)="requestToggle()"
        >
          <span>{{ header }}</span>
          <span aria-hidden="true">{{ active ? '−' : '+' }}</span>
        </button>
      </h3>
      <div class="j-accordion-panel__content" [hidden]="!active">
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
        min-height: 3rem;
        padding: 0 var(--j-spacing-lg, 1rem);
        text-align: left;
        width: 100%;
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
        color: var(--j-color-text, #111827);
        padding: 0 var(--j-spacing-lg, 1rem) var(--j-spacing-lg, 1rem);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JAccordionPanelComponent {
  @Input() header = '';
  @Input({ transform: booleanAttribute }) disabled = false;
  @Output() toggleRequest = new EventEmitter<JAccordionPanelComponent>();

  index = -1;
  active = false;

  requestToggle(): void {
    if (!this.disabled) {
      this.toggleRequest.emit(this);
    }
  }
}

@Component({
  selector: 'j-accordion',
  imports: [],
  template: `<div class="j-accordion"><ng-content></ng-content></div>`,
  styles: [
    `
      .j-accordion {
        background: var(--j-color-surface, #ffffff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-md, 0.5rem);
        color: var(--j-color-text, #111827);
        overflow: hidden;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JAccordionComponent implements AfterContentInit, OnChanges {
  private readonly changeDetector = inject(ChangeDetectorRef);

  @ContentChildren(JAccordionPanelComponent) panels?: QueryList<JAccordionPanelComponent>;
  @Input({ transform: booleanAttribute }) multiple = false;
  @Input() activeIndex: JAccordionActiveIndex = null;
  @Output() activeIndexChange = new EventEmitter<JAccordionActiveIndex>();

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
    if (changes['activeIndex'] || changes['multiple']) {
      this.syncPanels();
    }
  }

  togglePanel(panel: JAccordionPanelComponent): void {
    if (panel.disabled) {
      return;
    }

    if (this.multiple) {
      const current = Array.isArray(this.activeIndex) ? [...this.activeIndex] : [];
      this.activeIndex = current.includes(panel.index)
        ? current.filter((index) => index !== panel.index)
        : [...current, panel.index];
    } else {
      this.activeIndex = this.activeIndex === panel.index ? null : panel.index;
    }

    this.syncPanels();
    this.activeIndexChange.emit(this.activeIndex);
  }

  private syncPanels(): void {
    const activeIndexes = this.activeIndexes();
    this.panels?.forEach((panel, index) => {
      panel.index = index;
      panel.active = activeIndexes.includes(index);
    });
  }

  private bindPanels(): void {
    this.panels?.forEach((panel) => {
      panel.toggleRequest.subscribe((target) => this.togglePanel(target));
    });
  }

  private activeIndexes(): readonly number[] {
    if (Array.isArray(this.activeIndex)) {
      return this.activeIndex;
    }

    return typeof this.activeIndex === 'number' ? [this.activeIndex] : [];
  }
}
