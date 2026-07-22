import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { JDatePickerComponent } from 'jrng-ui/date-picker';
import { describe, expect, it } from 'vitest';
import { JFilterBarComponent } from './filter-bar.component';

describe('JFilterBarComponent', () => {
  it('uses two JRNG date pickers for an accessible date range', () => {
    const fixture = TestBed.createComponent(JFilterBarComponent);
    fixture.componentRef.setInput('showDateRange', true);
    fixture.detectChanges();

    const pickers = fixture.debugElement.queryAll(By.directive(JDatePickerComponent));
    expect(pickers).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('input[type="date"]')).toBeNull();
    expect((pickers[0].componentInstance as JDatePickerComponent).label()).toBe('Start date');
    expect((pickers[1].componentInstance as JDatePickerComponent).label()).toBe('End date');
  });

  it('preserves the public YYYY-MM-DD value contract and constrains the range', () => {
    const fixture = TestBed.createComponent(JFilterBarComponent);
    fixture.componentRef.setInput('showDateRange', true);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    let lastValue = component.value();
    component.filterChange.subscribe((value) => (lastValue = value));

    component.updateStartDate(new Date(2026, 6, 12));
    component.updateEndDate(new Date(2026, 6, 19));
    fixture.detectChanges();

    expect(lastValue.startDate).toBe('2026-07-12');
    expect(lastValue.endDate).toBe('2026-07-19');
    const pickers = fixture.debugElement.queryAll(By.directive(JDatePickerComponent));
    expect((pickers[0].componentInstance as JDatePickerComponent).maxDate()).toEqual(
      new Date(2026, 6, 19),
    );
    expect((pickers[1].componentInstance as JDatePickerComponent).minDate()).toEqual(
      new Date(2026, 6, 12),
    );
  });

  it('resets date values without changing the existing reset API', () => {
    const fixture = TestBed.createComponent(JFilterBarComponent);
    const component = fixture.componentInstance;
    let resetCount = 0;
    component.reset.subscribe(() => resetCount++);
    component.updateStartDate(new Date(2026, 6, 12));

    component.resetFilters();

    expect(component.startDate()).toBe('');
    expect(component.endDate()).toBe('');
    expect(resetCount).toBe(1);
  });
});
