import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { JStatusPageComponent } from './status-page.component';

describe('JStatusPageComponent', () => {
  it.each([
    ['empty', '.j-status-page__icon'],
    ['error', '.j-status-page__code'],
    ['maintenance', '.j-status-page__badge'],
  ] as const)('renders the %s content hierarchy', (variant, markerSelector) => {
    const fixture = TestBed.createComponent(JStatusPageComponent);
    fixture.componentRef.setInput('variant', variant);
    fixture.componentRef.setInput('marker', variant === 'error' ? '404' : variant);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(`.j-status-page--${variant}`)).toBeTruthy();
    expect(fixture.nativeElement.querySelector(markerSelector)).toBeTruthy();
  });
});
