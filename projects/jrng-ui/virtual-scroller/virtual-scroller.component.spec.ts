import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JVirtualScrollerComponent } from './virtual-scroller.component';

describe('JVirtualScrollerComponent', () => {
  let fixture: ComponentFixture<JVirtualScrollerComponent<number>>;
  let component: JVirtualScrollerComponent<number>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [JVirtualScrollerComponent] });
    fixture = TestBed.createComponent(JVirtualScrollerComponent<number>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'items',
      Array.from({ length: 100 }, (_, i) => i),
    );
    fixture.componentRef.setInput('itemSize', 40);
    fixture.componentRef.setInput('viewportItems', 10);
    // Intentionally NOT calling detectChanges(): these tests exercise the
    // no-rendered-viewport fallback path (signal inputs are set synchronously).
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

  it('renders loading placeholders when loading is enabled', () => {
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.j-virtual-scroller__placeholder').length).toBe(
      10,
    );
  });

  it('preserves rows and shows the loader only within the configured threshold', () => {
    fixture.componentRef.setInput(
      'items',
      Array.from({ length: 30 }, (_, index) => index),
    );
    fixture.componentRef.setInput('viewportItems', 5);
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('loadingThreshold', 2);
    component.first = 0;
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll('.j-virtual-scroller__item').length,
    ).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('.j-virtual-scroller__loader')).toBeNull();

    component.first = 23;
    fixture.componentRef.setInput('loadingThreshold', 3);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.j-virtual-scroller__loader')).toBeTruthy();
  });

  it('normalizes invalid dimensions instead of producing invalid layout or arrays', () => {
    fixture.componentRef.setInput('itemSize', 0);
    fixture.componentRef.setInput('viewportItems', -5);
    fixture.detectChanges();

    expect(component.resolvedItemSize).toBe(1);
    expect(component.resolvedViewportItems).toBe(1);
    expect(component.totalHeight).toBe(100);
    expect(component.placeholders).toHaveLength(1);
  });

  it('clamps a stale window when async data shrinks', () => {
    component.first = 80;
    fixture.componentRef.setInput('items', [1, 2, 3]);
    fixture.detectChanges();

    expect(component.resolvedFirst).toBe(2);
    expect(component.visibleItems).toEqual([3]);
    expect(component.offsetY).toBe(80);
  });

  it('clamps programmatic scrolling to valid item indexes', () => {
    expect(component.scrollToIndex(Number.POSITIVE_INFINITY)).toBe(97);
    expect(component.scrollToIndex(-10)).toBe(0);
  });
});
