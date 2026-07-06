import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JVirtualScrollerComponent } from './virtual-scroller.component';

describe('JVirtualScrollerComponent', () => {
  let component: JVirtualScrollerComponent<number>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [JVirtualScrollerComponent] });
    component = TestBed.createComponent(JVirtualScrollerComponent<number>).componentInstance;
    component.items = Array.from({ length: 100 }, (_, i) => i);
    component.itemSize = 40;
    component.viewportItems = 10;
  });

  it('computes total height from item count and size', () => {
    expect(component.totalHeight).toBe(4000);
  });

  it('renders only a windowed slice (viewport + buffer)', () => {
    expect(component.first).toBe(0);
    expect(component.visibleItems.length).toBe(14); // 10 + 4 buffer
    expect(component.offsetY).toBe(0);
  });

  it('advances the window on scroll', () => {
    component.handleScroll({ target: { scrollTop: 400 } } as unknown as Event);
    expect(component.first).toBe(8); // floor(400/40) - 2
    expect(component.offsetY).toBe(320);
    expect(component.visibleItems[0]).toBe(8);
  });

  it('scrollToIndex moves the window toward the target index', () => {
    // No rendered viewport in this instance -> uses the index-based fallback.
    expect(component.scrollToIndex(50)).toBe(48); // max(0, 50 - 2)
    expect(component.first).toBe(48);
  });
});
