import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JImageComponent } from './image.component';

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

  it('opens the shared preview when previewable is enabled', () => {
    fixture.componentRef.setInput('previewable', true);
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
