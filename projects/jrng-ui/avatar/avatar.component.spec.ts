import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { JAvatarComponent } from './avatar.component';

describe('JAvatarComponent', () => {
  it('renders explicit initials in the fallback label', () => {
    const fixture = TestBed.createComponent(JAvatarComponent);
    fixture.componentRef.setInput('initials', 'AB');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.j-avatar__label');
    expect(label).not.toBeNull();
    expect(label.textContent.trim()).toBe('AB');
  });

  it('derives initials from the label when no initials are provided', () => {
    const fixture = TestBed.createComponent(JAvatarComponent);
    fixture.componentRef.setInput('label', 'Jane Doe');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.j-avatar__label');
    expect(label.textContent.trim()).toBe('JD');
  });

  it('renders an image and hides the fallback when an image is set', () => {
    const fixture = TestBed.createComponent(JAvatarComponent);
    fixture.componentRef.setInput('image', 'https://example.com/a.png');
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img.j-avatar__image');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('https://example.com/a.png');
    expect(fixture.nativeElement.querySelector('.j-avatar__label')).toBeNull();
  });

  it('applies size and shape modifier classes to the root', () => {
    const fixture = TestBed.createComponent(JAvatarComponent);
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('shape', 'square');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('span[data-jc-name="avatar"]');
    expect(root.className).toContain('j-avatar');
    expect(root.className).toContain('j-avatar--lg');
    expect(root.className).toContain('j-avatar--square');
  });

  it('is non-interactive when zoom is disabled by default', () => {
    const fixture = TestBed.createComponent(JAvatarComponent);
    fixture.componentRef.setInput('image', 'profile.png');
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[data-jc-name="avatar"]');
    expect(root.getAttribute('role')).toBeNull();
    expect(root.getAttribute('tabindex')).toBeNull();
    expect(root.classList).not.toContain('j-avatar--zoomable');
  });

  it('opens image preview with mouse, Enter, and Space when zoom is enabled', () => {
    const fixture = TestBed.createComponent(JAvatarComponent);
    fixture.componentRef.setInput('image', 'profile.png');
    fixture.componentRef.setInput('canZoom', true);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[data-jc-name="avatar"]') as HTMLElement;
    root.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();

    fixture.componentInstance.previewVisible.set(false);
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.previewVisible()).toBe(true);

    fixture.componentInstance.previewVisible.set(false);
    root.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.previewVisible()).toBe(true);
  });

  it('closes on Escape and returns focus to the avatar', () => {
    const fixture = TestBed.createComponent(JAvatarComponent);
    fixture.componentRef.setInput('image', 'profile.png');
    fixture.componentRef.setInput('canZoom', true);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[data-jc-name="avatar"]') as HTMLElement;
    root.focus();
    root.click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.previewVisible()).toBe(false);
    expect(document.activeElement).toBe(root);
  });

  it('shows fallback initials after an image failure and resets for a new image', () => {
    const fixture = TestBed.createComponent(JAvatarComponent);
    fixture.componentRef.setInput('label', 'Alex Morgan');
    fixture.componentRef.setInput('image', 'broken.png');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('img.j-avatar__image').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.j-avatar__label').textContent.trim()).toBe('AM');

    fixture.componentRef.setInput('image', 'replacement.png');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img.j-avatar__image')).not.toBeNull();
  });
});
