import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  TemplateRef,
  ViewChild,
  booleanAttribute,
  inject,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { JLoaderComponent } from 'jrng-ui/loader';

export interface JVirtualScrollerLazyEvent {
  readonly first: number;
  readonly last: number;
  readonly rows: number;
}

export interface JVirtualScrollerItemContext<T> {
  readonly $implicit: T;
  readonly item: T;
  readonly index: number;
}

@Component({
  selector: 'j-virtual-scroller',
  imports: [JLoaderComponent, NgTemplateOutlet],
  template: `
    <div
      #viewport
      class="j-virtual-scroller"
      data-jc-name="virtual-scroller"
      data-jc-section="root"
      [style.height]="height()"
      [attr.aria-busy]="loading() || null"
      (scroll)="handleScroll($event)"
    >
      <div class="j-virtual-scroller__spacer" [style.height.px]="totalHeight">
        <div
          class="j-virtual-scroller__content"
          [style.transform]="'translateY(' + offsetY + 'px)'"
        >
          @if (loading() && !items().length) {
            @for (placeholder of placeholders; track placeholder) {
              <div
                class="j-virtual-scroller__placeholder"
                [style.height.px]="resolvedItemSize"
              ></div>
            }
          } @else {
            @for (
              item of visibleItems;
              track trackItem(item, resolvedFirst + $index);
              let index = $index
            ) {
              <div class="j-virtual-scroller__item" [style.height.px]="resolvedItemSize">
                @if (itemTemplate) {
                  <ng-container
                    [ngTemplateOutlet]="itemTemplate"
                    [ngTemplateOutletContext]="itemContext(item, resolvedFirst + index)"
                  />
                } @else {
                  {{ item }}
                }
              </div>
            }
            @if (showIncrementalLoader) {
              <div
                class="j-virtual-scroller__loader"
                [style.height.px]="resolvedItemSize"
                role="status"
              >
                <j-loader type="spinner" inline size="sm" [label]="loadingLabel()" />
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .j-virtual-scroller {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        overflow: auto;
        position: relative;
      }

      .j-virtual-scroller__spacer {
        position: relative;
      }

      .j-virtual-scroller__content {
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
      }

      .j-virtual-scroller__item {
        align-items: center;
        display: flex;
        padding: 0 var(--j-spacing-3);
      }

      .j-virtual-scroller__placeholder {
        animation: j-skeleton-pulse 1.2s ease-in-out infinite;
        background: var(--j-color-muted);
        border-bottom: 1px solid var(--j-color-border);
      }

      .j-virtual-scroller__loader {
        align-items: center;
        background: var(--j-color-surface);
        display: flex;
        justify-content: center;
        padding: 0 var(--j-spacing-3);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JVirtualScrollerComponent<T = unknown> {
  readonly items = input<readonly T[]>([]);
  readonly itemSize = input(44, { transform: numberAttribute });
  readonly viewportItems = input(12, { transform: numberAttribute });
  readonly height = input('28rem');
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingThreshold = input(4, { transform: numberAttribute });
  readonly loadingLabel = input('Loading more items');
  @ContentChild('jVirtualScrollerItem', { read: TemplateRef }) itemTemplate?: TemplateRef<
    JVirtualScrollerItemContext<T>
  >;

  readonly lazyLoad = output<JVirtualScrollerLazyEvent>();

  @ViewChild('viewport') private viewport?: ElementRef<HTMLElement>;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  first = 0;

  get resolvedItemSize(): number {
    return Math.max(1, Number.isFinite(this.itemSize()) ? this.itemSize() : 44);
  }

  get resolvedViewportItems(): number {
    return Math.max(
      1,
      Math.floor(Number.isFinite(this.viewportItems()) ? this.viewportItems() : 12),
    );
  }

  get resolvedFirst(): number {
    return Math.min(Math.max(0, this.first), Math.max(0, this.items().length - 1));
  }

  get totalHeight(): number {
    return (
      this.items().length * this.resolvedItemSize +
      (this.loading() && this.items().length ? this.resolvedItemSize : 0)
    );
  }

  get last(): number {
    return Math.min(this.items().length, this.resolvedFirst + this.resolvedViewportItems + 4);
  }

  get visibleItems(): readonly T[] {
    return this.items().slice(this.resolvedFirst, this.last);
  }

  get offsetY(): number {
    return this.resolvedFirst * this.resolvedItemSize;
  }

  get placeholders(): readonly number[] {
    return Array.from({ length: this.resolvedViewportItems }, (_, index) => index);
  }

  get showIncrementalLoader(): boolean {
    if (!this.loading() || !this.items().length) {
      return false;
    }
    return (
      this.items().length - this.last <=
      Math.max(0, Number.isFinite(this.loadingThreshold()) ? this.loadingThreshold() : 0)
    );
  }

  handleScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const nextFirst = Math.min(
      Math.max(0, this.items().length - 1),
      Math.max(0, Math.floor(element.scrollTop / this.resolvedItemSize) - 2),
    );
    if (nextFirst === this.first) {
      return;
    }
    this.first = nextFirst;
    if (this.lazy()) {
      this.lazyLoad.emit({
        first: this.resolvedFirst,
        last: this.last,
        rows: this.last - this.resolvedFirst,
      });
    }
  }

  /**
   * Scroll the item at `index` into view with minimal movement. Enables keyboard
   * navigation (e.g. active-option highlighting) to stay visible when a host list
   * is virtualized. Returns the new `first` index.
   */
  scrollToIndex(index: number): number {
    const element = this.viewport?.nativeElement;
    const safeIndex = Math.min(
      Math.max(0, this.items().length - 1),
      Math.max(0, Number.isFinite(index) ? Math.floor(index) : this.items().length - 1),
    );
    if (!element) {
      this.first = Math.max(0, safeIndex - 2);
      this.changeDetectorRef.markForCheck();
      return this.first;
    }
    const top = safeIndex * this.resolvedItemSize;
    const viewHeight = element.clientHeight;
    if (top < element.scrollTop) {
      element.scrollTop = top;
    } else if (top + this.resolvedItemSize > element.scrollTop + viewHeight) {
      element.scrollTop = top + this.resolvedItemSize - viewHeight;
    }
    this.first = Math.min(
      Math.max(0, this.items().length - 1),
      Math.max(0, Math.floor(element.scrollTop / this.resolvedItemSize) - 2),
    );
    // When the target is already in view no scroll event fires, so refresh the
    // rendered window explicitly rather than relying on the scroll listener.
    this.changeDetectorRef.markForCheck();
    return this.first;
  }

  itemContext(item: T, index: number): JVirtualScrollerItemContext<T> {
    return { $implicit: item, item, index };
  }

  trackItem(item: T, index: number): unknown {
    return typeof item === 'object' && item != null
      ? ((item as Record<string, unknown>)['id'] ?? index)
      : index;
  }
}
