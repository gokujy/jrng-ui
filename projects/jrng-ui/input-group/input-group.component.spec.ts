import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JInputGroupComponent } from './input-group.component';

describe('JInputGroupComponent', () => {
  let fixture: ComponentFixture<JInputGroupComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JInputGroupComponent);
    fixture.detectChanges();
  });

  it('uses the connected compact structure by default', () => {
    const group = fixture.nativeElement.querySelector('.j-input-group') as HTMLElement;
    expect(group.classList.contains('j-input-group--compact')).toBe(true);
    expect(group.getAttribute('role')).toBe('group');
  });

  it('publishes invalid, readonly, and accessible naming state', () => {
    fixture.componentRef.setInput('invalid', true);
    fixture.componentRef.setInput('readonly', true);
    fixture.componentRef.setInput('ariaLabel', 'Invoice total');
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector('.j-input-group') as HTMLElement;
    expect(group.classList.contains('is-invalid')).toBe(true);
    expect(group.classList.contains('is-readonly')).toBe(true);
    expect(group.getAttribute('aria-label')).toBe('Invoice total');
    expect(group.getAttribute('aria-readonly')).toBe('true');
  });

  it('becomes inert when disabled and recovers at runtime', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('.j-input-group') as HTMLElement;
    expect(group.hasAttribute('inert')).toBe(true);
    expect(group.getAttribute('aria-disabled')).toBe('true');

    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    expect(group.hasAttribute('inert')).toBe(false);
  });
});
