import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  DestroyRef,
  ElementRef,
  InjectionToken,
  OnDestroy,
  PLATFORM_ID,
  QueryList,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type JSplitterOrientation = 'horizontal' | 'vertical';

interface JSplitterController {
  readonly orientation: () => JSplitterOrientation;
  readonly disabled: () => boolean;
  readonly readOnly: () => boolean;
  separatorValue(index: number): { min: number; now: number; max: number };
  resizeAt(index: number, delta: number): void;
  resetSizes(): void;
}

const SPLITTER_CONTROLLER = new InjectionToken<JSplitterController>('JRNG_SPLITTER_CONTROLLER');

@Component({
  selector: 'j-splitter-panel',
  template: `
    @if (index > 0) {
      <div
        class="j-splitter-panel__gutter"
        role="separator"
        [attr.tabindex]="controller.disabled() || controller.readOnly() ? -1 : 0"
        [attr.aria-orientation]="controller.orientation()"
        [attr.aria-disabled]="controller.disabled() || controller.readOnly()"
        [attr.aria-valuemin]="controller.separatorValue(index).min"
        [attr.aria-valuenow]="controller.separatorValue(index).now"
        [attr.aria-valuemax]="controller.separatorValue(index).max"
        (pointerdown)="startResize($event)"
        (keydown)="resizeWithKeyboard($event)"
        (dblclick)="controller.resetSizes()"
      >
        <span class="j-splitter-panel__handle" aria-hidden="true"></span>
      </div>
    }
    <div class="j-splitter-panel__content"><ng-content></ng-content></div>
  `,
  host: {
    class: 'j-splitter-panel',
    '[style.flex-basis.%]': 'currentSize()',
    '[style.min-width.%]': "controller.orientation() === 'horizontal' ? minSize() : null",
    '[style.min-height.%]': "controller.orientation() === 'vertical' ? minSize() : null",
  },
  styles: [
    `
      :host {
        display: block;
        flex: 0 0 auto;
        min-width: 0;
        min-height: 0;
        position: relative;
      }
      .j-splitter-panel__content {
        block-size: 100%;
        overflow: auto;
      }
      .j-splitter-panel__gutter {
        align-items: center;
        display: flex;
        justify-content: center;
        position: absolute;
        z-index: 1;
        touch-action: none;
      }
      :host-context(.j-splitter--horizontal) .j-splitter-panel__gutter {
        block-size: 100%;
        cursor: col-resize;
        inline-size: var(--j-splitter-gutter-size, 0.5rem);
        inset-block: 0;
        inset-inline-start: calc(var(--j-splitter-gutter-size, 0.5rem) / -2);
      }
      :host-context(.j-splitter--vertical) .j-splitter-panel__gutter {
        block-size: var(--j-splitter-gutter-size, 0.5rem);
        cursor: row-resize;
        inline-size: 100%;
        inset-block-start: calc(var(--j-splitter-gutter-size, 0.5rem) / -2);
        inset-inline: 0;
      }
      .j-splitter-panel__handle {
        background: var(--j-color-border-strong);
        border-radius: 999px;
        block-size: 2rem;
        inline-size: 0.1875rem;
      }
      :host-context(.j-splitter--vertical) .j-splitter-panel__handle {
        block-size: 0.1875rem;
        inline-size: 2rem;
      }
      .j-splitter-panel__gutter:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
      .j-splitter-panel__gutter[aria-disabled='true'] {
        cursor: default;
        opacity: var(--j-disabled-opacity, 0.55);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSplitterPanelComponent implements OnDestroy {
  readonly controller = inject(SPLITTER_CONTROLLER);
  private readonly documentRef = inject(DOCUMENT);
  readonly size = input(50, { transform: numberAttribute });
  readonly minSize = input(10, { transform: numberAttribute });
  readonly maxSize = input(90, { transform: numberAttribute });
  readonly currentSize = signal(50);
  index = 0;
  private cleanupDrag?: () => void;

  startResize(event: PointerEvent): void {
    if (this.controller.disabled() || this.controller.readOnly()) return;
    event.preventDefault();
    this.stopResize();
    let origin = this.controller.orientation() === 'horizontal' ? event.clientX : event.clientY;
    const view = this.documentRef.defaultView;
    if (!view) return;
    const move = (next: PointerEvent) => {
      const position = this.controller.orientation() === 'horizontal' ? next.clientX : next.clientY;
      this.controller.resizeAt(this.index, position - origin);
      origin = position;
    };
    const stop = () => this.stopResize();
    view.addEventListener('pointermove', move);
    view.addEventListener('pointerup', stop, { once: true });
    view.addEventListener('pointercancel', stop, { once: true });
    this.cleanupDrag = () => {
      view.removeEventListener('pointermove', move);
      view.removeEventListener('pointerup', stop);
      view.removeEventListener('pointercancel', stop);
    };
  }

  resizeWithKeyboard(event: KeyboardEvent): void {
    if (this.controller.disabled() || this.controller.readOnly()) return;
    const previous = this.controller.orientation() === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const next = this.controller.orientation() === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.controller.resizeAt(this.index, event.key === 'Home' ? -10_000 : 10_000);
    } else if (event.key === previous || event.key === next) {
      event.preventDefault();
      this.controller.resizeAt(this.index, event.key === previous ? -10 : 10);
    }
  }

  ngOnDestroy(): void {
    this.stopResize();
  }
  private stopResize(): void {
    this.cleanupDrag?.();
    this.cleanupDrag = undefined;
  }
}

@Component({
  selector: 'j-splitter',
  providers: [{ provide: SPLITTER_CONTROLLER, useExisting: forwardRef(() => JSplitterComponent) }],
  template: `<div
    class="j-splitter"
    [class.j-splitter--horizontal]="orientation() === 'horizontal'"
    [class.j-splitter--vertical]="orientation() === 'vertical'"
    [class.is-disabled]="disabled()"
    [class]="styleClass()"
    data-jc-name="splitter"
    data-jc-section="root"
    [style.--j-splitter-gutter-size.px]="gutterSize()"
    [attr.aria-disabled]="disabled() || readOnly()"
  >
    <ng-content></ng-content>
  </div>`,
  styles: [
    `
      :host {
        align-self: stretch;
        box-sizing: border-box;
        display: block;
        inline-size: 100%;
        justify-self: stretch;
        min-width: 0;
        width: 100%;
      }

      .j-splitter {
        box-sizing: border-box;
        display: flex;
        inline-size: 100%;
        min-width: 0;
        overflow: hidden;
        width: 100%;
      }
      .j-splitter--vertical {
        flex-direction: column;
      }
      .j-splitter ::ng-deep > :not(j-splitter-panel) {
        flex: 1 1 0;
        min-width: 0;
      }
      .j-splitter.is-disabled {
        opacity: var(--j-disabled-opacity, 0.55);
      }
      @media (max-width: 640px) {
        .j-splitter.j-splitter--horizontal {
          flex-direction: column;
        }
        .j-splitter.j-splitter--horizontal ::ng-deep > j-splitter-panel {
          flex-basis: auto !important;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSplitterComponent implements AfterContentInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  @ContentChildren(JSplitterPanelComponent) panels?: QueryList<JSplitterPanelComponent>;
  readonly orientation = input<JSplitterOrientation>('horizontal');
  readonly gutterSize = input(8, { transform: numberAttribute });
  readonly styleClass = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly snapPoints = input<readonly number[]>([]);
  readonly storageKey = input<string | null>(null);
  readonly resize = output<readonly number[]>();
  readonly sizes = computed(() => this.panels?.map((panel) => panel.currentSize()) ?? []);
  private initialSizes: readonly number[] = [];

  ngAfterContentInit(): void {
    this.configurePanels();
    this.panels?.changes
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.configurePanels());
  }

  separatorValue(index: number): { min: number; now: number; max: number } {
    const panel = this.panels?.get(index - 1);
    return {
      min: panel?.minSize() ?? 0,
      now: panel?.currentSize() ?? 0,
      max: panel?.maxSize() ?? 100,
    };
  }

  resizeAt(index: number, pixelDelta: number): void {
    if (this.disabled() || this.readOnly() || index <= 0) return;
    const panels = this.panels?.toArray() ?? [];
    const before = panels[index - 1];
    const after = panels[index];
    const bounds = this.elementRef.nativeElement.getBoundingClientRect();
    const extent = this.orientation() === 'horizontal' ? bounds.width : bounds.height;
    let delta = (pixelDelta / Math.max(1, extent)) * 100;
    delta = Math.max(
      before.minSize() - before.currentSize(),
      Math.min(delta, before.maxSize() - before.currentSize()),
    );
    delta = Math.max(
      after.currentSize() - after.maxSize(),
      Math.min(delta, after.currentSize() - after.minSize()),
    );
    const beforeSize = this.snap(before.currentSize() + delta);
    const applied = beforeSize - before.currentSize();
    before.currentSize.set(beforeSize);
    after.currentSize.set(after.currentSize() - applied);
    this.persist();
    this.resize.emit(this.sizes());
  }

  resetSizes(): void {
    if (this.disabled() || this.readOnly()) return;
    this.applySizes(this.initialSizes);
    this.persist();
    this.resize.emit(this.sizes());
  }

  private configurePanels(): void {
    const panels = this.panels?.toArray() ?? [];
    panels.forEach((panel, index) => {
      panel.index = index;
      panel.currentSize.set(panel.size());
    });
    this.initialSizes = panels.map((panel) => panel.size());
    if (isPlatformBrowser(this.platformId) && this.storageKey()) {
      try {
        const storage = this.documentRef.defaultView?.localStorage;
        const saved = JSON.parse(storage?.getItem(this.storageKey()!) ?? 'null') as unknown;
        if (
          Array.isArray(saved) &&
          saved.length === panels.length &&
          saved.every(
            (item, index) =>
              typeof item === 'number' &&
              Number.isFinite(item) &&
              item >= panels[index].minSize() &&
              item <= panels[index].maxSize(),
          )
        ) {
          this.applySizes(saved);
        }
      } catch {
        /* Ignore malformed or unavailable storage. */
      }
    }
  }

  private applySizes(sizes: readonly number[]): void {
    this.panels?.forEach((panel, index) => panel.currentSize.set(sizes[index] ?? panel.size()));
  }
  private snap(value: number): number {
    return this.snapPoints().reduce(
      (best, point) =>
        Math.abs(point - value) < Math.abs(best - value) && Math.abs(point - value) <= 2
          ? point
          : best,
      value,
    );
  }
  private persist(): void {
    if (!isPlatformBrowser(this.platformId) || !this.storageKey()) return;
    try {
      this.documentRef.defaultView?.localStorage.setItem(
        this.storageKey()!,
        JSON.stringify(this.sizes()),
      );
    } catch {
      /* Storage can be unavailable. */
    }
  }
}
