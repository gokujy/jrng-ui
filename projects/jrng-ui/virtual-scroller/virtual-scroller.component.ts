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
  imports: [NgTemplateOutlet],
  template: `
    <div
      #viewport
      class="j-virtual-scroller"
      data-jc-name="virtual-scroller"
      data-jc-section="root"
      [style.height]="height()"
      (scroll)="handleScroll($event)"
    >
      <div class="j-virtual-scroller__spacer" [style.height.px]="totalHeight">
        <div
          class="j-virtual-scroller__content"
          [style.transform]="'translateY(' + offsetY + 'px)'"
        >
          @if (loading()) {
            @for (placeholder of placeholders; track placeholder) {
              <div class="j-virtual-scroller__placeholder" [style.height.px]="itemSize()"></div>
            }
          } @else {
            @for (item of visibleItems; track trackItem(item, $index); let index = $index) {
              <div class="j-virtual-scroller__item" [style.height.px]="itemSize()">
                @if (itemTemplate) {
                  <ng-container
                    [ngTemplateOutlet]="itemTemplate"
                    [ngTemplateOutletContext]="itemContext(item, first + index)"
                  />
                } @else {
                  {{ item }}
                }
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
  @ContentChild('jVirtualScrollerItem', { read: TemplateRef }) itemTemplate?: TemplateRef<
    JVirtualScrollerItemContext<T>
  >;

  readonly lazyLoad = output<JVirtualScrollerLazyEvent>();

  @ViewChild('viewport') private viewport?: ElementRef<HTMLElement>;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  first = 0;

  get totalHeight(): number {
    return this.items().length * this.itemSize();
  }

  get last(): number {
    return Math.min(this.items().length, this.first + this.viewportItems() + 4);
  }

  get visibleItems(): readonly T[] {
    return this.items().slice(this.first, this.last);
  }

  get offsetY(): number {
    return this.first * this.itemSize();
  }

  get placeholders(): readonly number[] {
    return Array.from({ length: this.viewportItems() }, (_, index) => index);
  }

  handleScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const nextFirst = Math.max(0, Math.floor(element.scrollTop / this.itemSize()) - 2);
    if (nextFirst === this.first) {
      return;
    }
    this.first = nextFirst;
    if (this.lazy()) {
      this.lazyLoad.emit({ first: this.first, last: this.last, rows: this.last - this.first });
    }
  }

  /**
   * Scroll the item at `index` into view with minimal movement. Enables keyboard
   * navigation (e.g. active-option highlighting) to stay visible when a host list
   * is virtualized. Returns the new `first` index.
   */
  scrollToIndex(index: number): number {
    const element = this.viewport?.nativeElement;
    if (!element) {
      this.first = Math.max(0, index - 2);
      this.changeDetectorRef.markForCheck();
      return this.first;
    }
    const top = index * this.itemSize();
    const viewHeight = element.clientHeight;
    if (top < element.scrollTop) {
      element.scrollTop = top;
    } else if (top + this.itemSize() > element.scrollTop + viewHeight) {
      element.scrollTop = top + this.itemSize() - viewHeight;
    }
    this.first = Math.max(0, Math.floor(element.scrollTop / this.itemSize()) - 2);
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
