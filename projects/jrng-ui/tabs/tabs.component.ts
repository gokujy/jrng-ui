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
  linkedSignal,
  numberAttribute,
  output,
} from '@angular/core';

let nextTabId = 0;

/** Complete tab-list presentation presets. `default` preserves the underline treatment. */
export type JTabsVariant = 'default' | 'pills' | 'segmented';

@Component({
  selector: 'j-tab',
  imports: [],
  template: `
    @if (!closed && (!lazy || initialized)) {
      <section
        class="j-tab"
        data-jc-name="tabs"
        data-jc-section="panel"
        [attr.data-j-selected]="active ? 'true' : null"
        [attr.data-j-active]="active ? 'true' : null"
        role="tabpanel"
        [id]="panelId"
        [attr.aria-labelledby]="tabId"
        [hidden]="!active || closed"
      >
        <ng-content></ng-content>
      </section>
    }
  `,
  styles: [
    `
      .j-tab {
        padding: var(--j-spacing-lg, 1rem) 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTabComponent {
  readonly header = input('');
  readonly label = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly closable = input(false, { transform: booleanAttribute });

  readonly id = `j-tab-${nextTabId++}`;
  index = -1;
  active = false;
  closed = false;
  lazy = false;
  initialized = false;

  get title(): string {
    return this.header() || this.label() || `Tab ${this.index + 1}`;
  }

  get tabId(): string {
    return `${this.id}-tab`;
  }

  get panelId(): string {
    return `${this.id}-panel`;
  }
}

@Component({
  selector: 'j-tabs',
  imports: [],
  template: `
    <div
      class="j-tabs"
      [class.is-scrollable]="scrollable()"
      [class]="'j-tabs j-tabs--' + variant()"
      [attr.data-j-variant]="variant()"
      data-jc-name="tabs"
      data-jc-section="root"
      data-jc-extend="tab panel close"
    >
      <div
        class="j-tabs__list"
        data-jc-section="list"
        role="tablist"
        tabindex="0"
        [attr.aria-orientation]="orientation()"
        (keydown)="handleKeydown($event)"
      >
        @for (tab of visibleTabs; track tab.id; let index = $index) {
          <div class="j-tabs__tab-group" role="presentation">
            <button
              type="button"
              class="j-tabs__tab"
              data-jc-section="tab"
              role="tab"
              [id]="tab.tabId"
              [class.is-active]="tab.active"
              [disabled]="tab.disabled()"
              [attr.data-j-selected]="tab.active ? 'true' : null"
              [attr.data-j-active]="tab.active ? 'true' : null"
              [attr.data-j-disabled]="tab.disabled() ? 'true' : null"
              [attr.aria-selected]="tab.active"
              [attr.aria-controls]="tab.panelId"
              [attr.tabindex]="tab.active ? 0 : -1"
              (click)="selectTab(tab.index)"
            >
              <span>{{ tab.title }}</span>
            </button>
            @if (tab.closable()) {
              <button
                type="button"
                class="j-tabs__close"
                data-jc-section="close"
                [attr.aria-label]="'Close ' + tab.title"
                [disabled]="tab.disabled()"
                (click)="closeTab(tab.index, $event)"
              >
                ×
              </button>
            }
          </div>
        }
      </div>
      <div class="j-tabs__panels" data-jc-section="panels">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .j-tabs {
        color: var(--j-color-text, #111827);
      }

      .j-tabs__list {
        border-bottom: 1px solid var(--j-color-border, #dbe2ea);
        display: flex;
        gap: var(--j-spacing-xs, 0.25rem);
        overflow-x: hidden;
      }

      .j-tabs.is-scrollable .j-tabs__list {
        overflow-x: auto;
      }

      .j-tabs__tab {
        align-items: center;
        background: transparent;
        border: 0;
        border-bottom: 2px solid transparent;
        color: var(--j-color-text-muted, #64748b);
        cursor: pointer;
        display: inline-flex;
        font: inherit;
        font-weight: var(--j-font-weight-medium, 550);
        gap: var(--j-spacing-sm, 0.5rem);
        min-height: 2.75rem;
        padding: 0 var(--j-spacing-lg, 1rem);
      }

      .j-tabs__tab-group {
        align-items: center;
        display: inline-flex;
      }

      .j-tabs__tab.is-active {
        border-bottom-color: var(--j-color-primary, #4f46e5);
        color: var(--j-color-primary, #4f46e5);
      }

      .j-tabs__tab:disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity, 0.55);
      }

      .j-tabs__tab:focus-visible,
      .j-tabs__close:focus-visible {
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
        outline: none;
      }

      .j-tabs__close {
        background: transparent;
        border: 0;
        border-radius: var(--j-radius-full, 999px);
        color: inherit;
        cursor: pointer;
        font: inherit;
        height: 1.5rem;
        line-height: 1;
        width: 1.5rem;
      }

      .j-tabs--pills .j-tabs__list {
        border: 0;
        gap: var(--j-spacing-xs, 0.25rem);
      }

      .j-tabs--pills .j-tabs__tab {
        border: 0;
        border-radius: var(--j-radius-full, 999px);
      }

      .j-tabs--pills .j-tabs__tab.is-active {
        background: var(--j-color-primary, #4f46e5);
        color: var(--j-color-on-primary, #ffffff);
      }

      .j-tabs--segmented .j-tabs__list {
        background: var(--j-color-surface-subtle, #eef2f7);
        border: 0;
        border-radius: var(--j-radius-lg, 0.75rem);
        gap: var(--j-spacing-2xs, 0.125rem);
        padding: var(--j-spacing-xs, 0.25rem);
      }

      .j-tabs--segmented .j-tabs__tab {
        border: 0;
        border-radius: var(--j-radius-md, 0.5rem);
        min-height: 2.25rem;
      }

      .j-tabs--segmented .j-tabs__tab.is-active {
        background: var(--j-color-surface, #ffffff);
        box-shadow: var(--j-shadow-sm);
        color: var(--j-color-text, #111827);
      }

      .j-tabs:has(.j-tabs__list[aria-orientation='vertical']) {
        display: grid;
        gap: var(--j-spacing-lg, 1rem);
        grid-template-columns: minmax(10rem, auto) minmax(0, 1fr);
      }

      .j-tabs__list[aria-orientation='vertical'] {
        align-items: stretch;
        border-bottom: 0;
        border-inline-end: 1px solid var(--j-color-border, #dbe2ea);
        flex-direction: column;
      }

      .j-tabs__list[aria-orientation='vertical'] .j-tabs__tab-group,
      .j-tabs__list[aria-orientation='vertical'] .j-tabs__tab {
        justify-content: space-between;
        width: 100%;
      }

      @media (max-width: 640px) {
        .j-tabs:has(.j-tabs__list[aria-orientation='vertical']) {
          display: block;
        }

        .j-tabs__list[aria-orientation='vertical'] {
          border-bottom: 1px solid var(--j-color-border, #dbe2ea);
          border-inline-end: 0;
          flex-direction: row;
          overflow-x: auto;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTabsComponent implements AfterContentInit, OnChanges {
  private readonly changeDetector = inject(ChangeDetectorRef);

  @ContentChildren(JTabComponent) tabs?: QueryList<JTabComponent>;

  readonly selectedIndex = input(0, { transform: numberAttribute });
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly scrollable = input(true, { transform: booleanAttribute });
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly variant = input<JTabsVariant>('default');
  readonly selectedIndexChange = output<number>();
  readonly tabClose = output<number>();

  protected readonly selectedIndexState = linkedSignal(() => this.selectedIndex());

  get visibleTabs(): readonly JTabComponent[] {
    return this.tabArray.filter((tab) => !tab.closed);
  }

  private get tabArray(): readonly JTabComponent[] {
    return this.tabs?.toArray() ?? [];
  }

  ngAfterContentInit(): void {
    this.syncTabs();
    this.tabs?.changes.subscribe(() => {
      this.syncTabs();
      this.changeDetector.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedIndex'] || changes['lazy']) {
      this.syncTabs();
    }
  }

  selectTab(index: number): void {
    const tab = this.tabArray[index];

    if (!tab || tab.disabled() || tab.closed || index === this.selectedIndexState()) {
      return;
    }

    this.selectedIndexState.set(index);
    this.syncTabs();
    this.selectedIndexChange.emit(index);
  }

  closeTab(index: number, event: MouseEvent): void {
    event.stopPropagation();
    const tab = this.tabArray[index];

    if (!tab || !tab.closable()) {
      return;
    }

    tab.closed = true;
    this.tabClose.emit(index);

    if (index === this.selectedIndexState()) {
      const next = this.tabArray.find((candidate) => !candidate.closed && !candidate.disabled());
      this.selectedIndexState.set(next?.index ?? -1);
      this.selectedIndexChange.emit(this.selectedIndexState());
    }

    this.syncTabs();
  }

  handleCloseKeydown(index: number, event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const tab = this.tabArray[index];

    if (!tab || !tab.closable()) {
      return;
    }

    tab.closed = true;
    this.tabClose.emit(index);

    if (index === this.selectedIndexState()) {
      const next = this.tabArray.find((candidate) => !candidate.closed && !candidate.disabled());
      this.selectedIndexState.set(next?.index ?? -1);
      this.selectedIndexChange.emit(this.selectedIndexState());
    }

    this.syncTabs();
  }

  handleKeydown(event: KeyboardEvent): void {
    const previousKey = this.orientation() === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
    const nextKey = this.orientation() === 'vertical' ? 'ArrowDown' : 'ArrowRight';

    if (![previousKey, nextKey, 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const enabled = this.visibleTabs.filter((tab) => !tab.disabled());

    if (!enabled.length) {
      return;
    }

    const current = Math.max(
      0,
      enabled.findIndex((tab) => tab.index === this.selectedIndexState()),
    );
    const last = enabled.length - 1;
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? last
          : event.key === nextKey
            ? current === last
              ? 0
              : current + 1
            : current === 0
              ? last
              : current - 1;

    this.selectTab(enabled[next]?.index ?? this.selectedIndexState());
  }

  private syncTabs(): void {
    const tabs = this.tabArray;
    tabs.forEach((tab, index) => {
      tab.index = index;
      tab.lazy = this.lazy();
      tab.active = index === this.selectedIndexState() && !tab.closed;
      tab.initialized = tab.initialized || tab.active || !this.lazy();
    });
  }
}
