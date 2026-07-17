import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JImageComponent, JImagePreviewComponent } from './image-preview.component';

describe('JImagePreviewComponent', () => {
  let fixture: ComponentFixture<JImagePreviewComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JImagePreviewComponent);
    fixture.componentRef.setInput('src', '/profile.svg');
    fixture.componentRef.setInput('alt', 'Avery Reed profile');
  });

  it('uses dialog semantics, moves focus inside, and closes with Escape', async () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const dialog = fixture.debugElement.query(By.css('[role="dialog"]'));
    const close = fixture.debugElement.query(By.css('.j-image-preview__close'))
      .nativeElement as HTMLButtonElement;
    expect(dialog.attributes['aria-modal']).toBe('true');
    expect(dialog.attributes['aria-label']).toBe('Avery Reed profile');
    expect(document.activeElement).toBe(close);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBe(false);
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('emits closed when the backdrop is activated', () => {
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    fixture.debugElement.query(By.css('.j-image-preview__backdrop')).nativeElement.click();
    expect(closed).toHaveBeenCalledOnce();
  });
});

describe('JImageComponent', () => {
  let fixture: ComponentFixture<JImageComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JImageComponent);
    fixture.componentRef.setInput('src', '/primary.svg');
    fixture.componentRef.setInput('fallback', '/fallback.svg');
    fixture.componentRef.setInput('alt', 'Profile');
    fixture.detectChanges();
  });

  it('is static by default and exposes alternative text', () => {
    expect(fixture.debugElement.query(By.css('button'))).toBeNull();
    expect(fixture.debugElement.query(By.css('img')).attributes['alt']).toBe('Profile');
  });

  it('opens the shared preview when preview is enabled', () => {
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    fixture.debugElement.query(By.css('.j-image__button')).nativeElement.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.previewVisible()).toBe(true);
    expect(fixture.debugElement.query(By.css('[role="dialog"]'))).not.toBeNull();
  });

  it('uses the fallback once when the image fails', () => {
    const image = fixture.debugElement.query(By.css('img'));
    image.triggerEventHandler('error');
    fixture.detectChanges();
    expect(fixture.componentInstance.currentSrc()).toBe('/fallback.svg');
    image.triggerEventHandler('error');
    expect(fixture.componentInstance.currentSrc()).toBe('/fallback.svg');
  });
});
