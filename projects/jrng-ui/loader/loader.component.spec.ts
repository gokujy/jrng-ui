import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JLoaderComponent, JLoaderVariant } from './loader.component';

describe('JLoaderComponent', () => {
  const variants: readonly JLoaderVariant[] = [
    'spinner',
    'dots',
    'pulse',
    'ring',
    'dual-ring',
    'bars',
    'wave',
    'bounce',
    'orbit',
    'typing',
  ];

  it('preserves the dots compatibility default and renders every loader type', () => {
    const fixture = TestBed.createComponent(JLoaderComponent);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.j-loader--dots'))).not.toBeNull();
    for (const type of variants) {
      fixture.componentRef.setInput('type', type);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css(`.j-loader--${type}`))).not.toBeNull();
    }
  });

  it('falls back to spinner for an invalid runtime type', () => {
    const fixture = TestBed.createComponent(JLoaderComponent);
    fixture.componentRef.setInput('type', 'unknown');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.j-loader--spinner'))).not.toBeNull();
  });

  it('supports named and numeric sizes with a readable status label', () => {
    const fixture = TestBed.createComponent(JLoaderComponent);
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('label', 'Loading account summary');
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[data-jc-name="loader"]') as HTMLElement;
    expect(root.style.width).toBe('48px');
    expect(root.getAttribute('role')).toBe('status');
    expect(root.getAttribute('aria-label')).toBe('Loading account summary');
    fixture.componentRef.setInput('size', 37);
    fixture.detectChanges();
    expect(root.style.width).toBe('37px');
  });

  it('renders inline, overlay, and fullscreen presentation classes', () => {
    const fixture = TestBed.createComponent(JLoaderComponent);
    fixture.componentRef.setInput('inline', true);
    fixture.componentRef.setInput('overlay', true);
    fixture.componentRef.setInput('fullscreen', true);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('.j-loader') as HTMLElement;
    expect(root.classList).toContain('j-loader--inline');
    expect(root.classList).toContain('j-loader--overlay');
    expect(root.classList).toContain('j-loader--fullscreen');
    expect(root.textContent).toContain('Loading');
  });

  it('clamps determinate values and exposes progress semantics', () => {
    const fixture = TestBed.createComponent(JLoaderComponent);
    fixture.componentRef.setInput('type', 'ring');
    fixture.componentRef.setInput('value', 140);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('.j-loader') as HTMLElement;
    expect(root.getAttribute('role')).toBe('progressbar');
    expect(root.getAttribute('aria-valuenow')).toBe('100');
    fixture.componentRef.setInput('value', -5);
    fixture.detectChanges();
    expect(root.getAttribute('aria-valuenow')).toBe('0');
  });

  it('retains the deprecated variant input as a compatibility alias', () => {
    const fixture = TestBed.createComponent(JLoaderComponent);
    fixture.componentRef.setInput('variant', 'pulse');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.j-loader--pulse')).not.toBeNull();
  });
});
