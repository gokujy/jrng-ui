import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JCarouselComponent } from './carousel.component';

describe('JCarouselComponent public contract', () => {
  const metadata = reflectComponentType(JCarouselComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-carousel');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});

describe('JCarouselComponent navigation', () => {
  it('keeps multi-item navigation within the last complete viewport', () => {
    const fixture = TestBed.createComponent(JCarouselComponent);
    fixture.componentRef.setInput(
      'value',
      Array.from({ length: 4 }, (_, index) => ({ title: `Item ${index + 1}` })),
    );
    fixture.componentRef.setInput('visibleItems', 2);
    fixture.componentRef.setInput('loop', false);
    fixture.detectChanges();

    fixture.componentInstance.next();
    fixture.componentInstance.next();
    fixture.componentInstance.next();

    expect(fixture.componentInstance.activeIndex()).toBe(2);
    expect(fixture.componentInstance.indicatorIndexes()).toEqual([0, 1, 2]);
  });

  it('supports keyboard navigation and exposes a carousel label', () => {
    const fixture = TestBed.createComponent(JCarouselComponent);
    fixture.componentRef.setInput('value', [{ title: 'One' }, { title: 'Two' }]);
    fixture.componentRef.setInput('ariaLabel', 'Product gallery');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.j-carousel') as HTMLElement;
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex()).toBe(1);
    expect(root.getAttribute('aria-label')).toBe('Product gallery');
  });

  it('normalizes invalid configuration and renders no controls as active for empty data', () => {
    const fixture = TestBed.createComponent(JCarouselComponent);
    fixture.componentRef.setInput('visibleItems', Number.NaN);
    fixture.componentRef.setInput('activeIndex', Number.NaN);
    fixture.detectChanges();

    expect(fixture.componentInstance.normalizedVisibleItems()).toBe(1);
    expect(fixture.componentInstance.activeIndex()).toBe(0);
    expect(fixture.componentInstance.indicatorIndexes()).toEqual([]);
    const controls = fixture.nativeElement.querySelectorAll(
      '.j-carousel__control',
    ) as NodeListOf<HTMLButtonElement>;
    expect([...controls].every((control) => control.disabled)).toBe(true);
  });
});
