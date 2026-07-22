import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { JDividerComponent } from './divider.component';

describe('JDividerComponent', () => {
  it('exposes semantic orientation and visual line variants', () => {
    const fixture = TestBed.createComponent(JDividerComponent);
    fixture.componentRef.setInput('layout', 'vertical');
    fixture.componentRef.setInput('lineStyle', 'dashed');
    fixture.componentRef.setInput('strength', 'strong');
    fixture.componentRef.setInput('spacing', 'spacious');
    fixture.detectChanges();

    const divider = fixture.nativeElement.querySelector('[role="separator"]') as HTMLElement;
    expect(divider.getAttribute('aria-orientation')).toBe('vertical');
    expect(divider.classList).toContain('j-divider--dashed');
    expect(divider.classList).toContain('j-divider--strong');
    expect(divider.classList).toContain('j-divider--spacious');
  });

  it('renders positioned text and JRNG icon content', () => {
    const fixture = TestBed.createComponent(JDividerComponent);
    fixture.componentRef.setInput('text', 'Account settings');
    fixture.componentRef.setInput('icon', 'settings');
    fixture.componentRef.setInput('position', 'start');
    fixture.componentRef.setInput('inset', true);
    fixture.detectChanges();

    const divider = fixture.nativeElement.querySelector('.j-divider') as HTMLElement;
    expect(divider.classList).toContain('j-divider--start');
    expect(divider.classList).toContain('j-divider--inset');
    expect(divider.textContent).toContain('Account settings');
    expect(divider.querySelector('j-icon svg')).toBeTruthy();
  });
});
