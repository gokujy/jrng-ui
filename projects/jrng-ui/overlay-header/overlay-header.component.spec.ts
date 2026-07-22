import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { JInternalOverlayHeaderComponent } from './overlay-header.component';

describe('JInternalOverlayHeaderComponent', () => {
  let fixture: ComponentFixture<JInternalOverlayHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JInternalOverlayHeaderComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(JInternalOverlayHeaderComponent);
  });

  it('connects the supplied title id and exposes an accessible JRNG close action', () => {
    fixture.componentRef.setInput('title', 'Preview');
    fixture.componentRef.setInput('titleId', 'preview-title');
    fixture.componentRef.setInput('closeLabel', 'Close preview');
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h2') as HTMLHeadingElement;
    const close = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(title.id).toBe('preview-title');
    expect(close.getAttribute('aria-label')).toBe('Close preview');
  });

  it('emits close and supports programmatic close focus', () => {
    let closeCount = 0;
    fixture.componentInstance.close.subscribe(() => closeCount++);
    fixture.detectChanges();

    fixture.componentInstance.focusClose();
    const close = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(document.activeElement).toBe(close);
    close.click();
    expect(closeCount).toBe(1);
  });

  it('removes the close action when closable is false', () => {
    fixture.componentRef.setInput('closable', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
