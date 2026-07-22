import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { JBadgeComponent } from './badge.component';

describe('JBadgeComponent', () => {
  function span(nativeElement: HTMLElement): HTMLElement {
    return nativeElement.querySelector('span') as HTMLElement;
  }

  it('renders the value text in the host element', () => {
    const fixture = TestBed.createComponent(JBadgeComponent);
    fixture.componentRef.setInput('value', '5');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('5');
  });

  it('reflects value input changes', () => {
    const fixture = TestBed.createComponent(JBadgeComponent);
    fixture.componentRef.setInput('value', '5');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('5');

    fixture.componentRef.setInput('value', '42');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('42');
    expect(fixture.nativeElement.textContent).not.toContain('5');
  });

  it('applies severity, size, and rounded classes by default', () => {
    const fixture = TestBed.createComponent(JBadgeComponent);
    fixture.detectChanges();

    const classes = span(fixture.nativeElement).classList;
    expect(classes).toContain('j-badge');
    expect(classes).toContain('j-badge--primary');
    expect(classes).toContain('j-badge--md');
    expect(classes).toContain('j-badge--rounded');
  });

  it('reflects severity, size, rounded, and active inputs', () => {
    const fixture = TestBed.createComponent(JBadgeComponent);
    fixture.componentRef.setInput('severity', 'danger');
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('rounded', false);
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    const el = span(fixture.nativeElement);
    expect(el.classList).toContain('j-badge--danger');
    expect(el.classList).toContain('j-badge--lg');
    expect(el.classList).not.toContain('j-badge--rounded');
    expect(el.getAttribute('data-j-active')).toBe('true');
  });

  it('caps numeric notification counts and supports dot accessibility', () => {
    const fixture = TestBed.createComponent(JBadgeComponent);
    fixture.componentRef.setInput('value', 148);
    fixture.componentRef.setInput('max', 99);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('99+');

    fixture.componentRef.setInput('dot', true);
    fixture.componentRef.setInput('ariaLabel', '3 unread notifications');
    fixture.detectChanges();
    const el = span(fixture.nativeElement);
    expect(el.classList).toContain('j-badge--dot');
    expect(el.getAttribute('aria-label')).toBe('3 unread notifications');
  });

  it('supports soft, outlined, muted, disabled, and icon compositions', () => {
    const fixture = TestBed.createComponent(JBadgeComponent);
    fixture.componentRef.setInput('value', 'Verified');
    fixture.componentRef.setInput('variant', 'outlined');
    fixture.componentRef.setInput('icon', 'check');
    fixture.componentRef.setInput('muted', true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const el = span(fixture.nativeElement);
    expect(el.classList).toContain('j-badge--outlined');
    expect(el.classList).toContain('is-muted');
    expect(el.getAttribute('aria-disabled')).toBe('true');
    expect(el.querySelector('j-icon svg')).toBeTruthy();
  });
});
