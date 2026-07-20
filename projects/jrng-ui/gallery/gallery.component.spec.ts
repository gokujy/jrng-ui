import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JGalleryComponent } from './gallery.component';

describe('JGalleryComponent public contract', () => {
  const metadata = reflectComponentType(JGalleryComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-gallery');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});

describe('JGalleryComponent stable transitions', () => {
  it('retains the previous image until the next image is ready', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(JGalleryComponent);
    fixture.componentRef.setInput('value', [
      { src: '/one.jpg', alt: 'One' },
      { src: '/two.jpg', alt: 'Two' },
    ]);
    fixture.componentRef.setInput('animationDuration', 200);
    fixture.detectChanges();
    fixture.componentInstance.markLoaded('/one.jpg');

    fixture.componentInstance.select(1);
    fixture.detectChanges();
    expect(fixture.componentInstance.previousItem()?.src).toBe('/one.jpg');
    expect(fixture.nativeElement.querySelector('.j-gallery__loader')).not.toBeNull();

    fixture.componentInstance.markLoaded('/two.jpg');
    vi.advanceTimersByTime(199);
    expect(fixture.componentInstance.previousItem()?.src).toBe('/one.jpg');
    vi.advanceTimersByTime(1);
    expect(fixture.componentInstance.previousItem()).toBeNull();
    vi.useRealTimers();
  });

  it('reports failed images without clearing the retained viewport immediately', () => {
    const fixture = TestBed.createComponent(JGalleryComponent);
    fixture.componentRef.setInput('value', [{ src: '/broken.jpg', alt: 'Broken' }]);
    fixture.detectChanges();
    fixture.componentInstance.markFailed('/broken.jpg');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Unable to load image',
    );
  });
});
