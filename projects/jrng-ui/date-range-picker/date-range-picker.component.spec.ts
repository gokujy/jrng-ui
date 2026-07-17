import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { JDateRangePickerComponent } from './date-range-picker.component';

describe('JDateRangePickerComponent', () => {
  it('keeps the existing selector and renders the shared calendar icon', () => {
    const fixture = TestBed.createComponent(JDateRangePickerComponent);
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector(
      '.j-date-range-picker__icon j-icon svg path',
    ) as SVGPathElement | null;
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute('d')).toContain('M8 2v4');
  });
});
