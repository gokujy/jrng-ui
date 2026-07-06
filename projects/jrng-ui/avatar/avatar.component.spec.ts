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
});
