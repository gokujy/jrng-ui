import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JBodyScrollLockService } from 'jrng-ui/core';
import { JInternalImageViewerComponent } from './image-viewer.component';

describe('JInternalImageViewerComponent', () => {
  it('opens as a named modal and restores page scrolling when closed', () => {
    const fixture = TestBed.createComponent(JInternalImageViewerComponent);
    fixture.componentRef.setInput('src', '/preview.svg');
    fixture.componentRef.setInput('alt', 'Architecture diagram');
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    const dialog = fixture.debugElement.query(By.css('[role="dialog"]'));
    expect(dialog.attributes['aria-modal']).toBe('true');
    expect(dialog.attributes['aria-label']).toBe('Architecture diagram');
    expect(document.body.style.overflow).toBe('hidden');

    fixture.debugElement.query(By.css('.j-image-viewer__backdrop')).nativeElement.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.visible()).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('honors backdrop dismissal and clamps zoom to safe bounds', () => {
    const fixture = TestBed.createComponent(JInternalImageViewerComponent);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('closeOnBackdrop', false);
    fixture.detectChanges();

    fixture.debugElement.query(By.css('.j-image-viewer__backdrop')).nativeElement.click();
    expect(fixture.componentInstance.visible()).toBe(true);

    fixture.componentInstance.zoomBy(100);
    expect(fixture.componentInstance.scale()).toBe(4);
    fixture.componentInstance.zoomBy(-100);
    expect(fixture.componentInstance.scale()).toBe(0.25);

    fixture.destroy();
    expect(document.body.style.overflow).toBe('');
  });

  it('closes on Escape and emits once', () => {
    const fixture = TestBed.createComponent(JInternalImageViewerComponent);
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.visible()).toBe(false);
    expect(closed).toHaveBeenCalledOnce();
  });

  it('does not unlock the page while another overlay still owns a lock', () => {
    const scrollLock = TestBed.inject(JBodyScrollLockService);
    scrollLock.lock();
    const fixture = TestBed.createComponent(JInternalImageViewerComponent);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    fixture.destroy();
    expect(document.body.style.overflow).toBe('hidden');

    scrollLock.unlock();
    expect(document.body.style.overflow).toBe('');
  });

  it('only closes the topmost image viewer on Escape', () => {
    const first = TestBed.createComponent(JInternalImageViewerComponent);
    first.componentRef.setInput('visible', true);
    first.detectChanges();
    const second = TestBed.createComponent(JInternalImageViewerComponent);
    second.componentRef.setInput('visible', true);
    second.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    first.detectChanges();
    second.detectChanges();

    expect(first.componentInstance.visible()).toBe(true);
    expect(second.componentInstance.visible()).toBe(false);
  });
});
