import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { jLocales, provideJrngLocale } from 'jrng-ui/core';
import { JDatePickerComponent } from './date-picker.component';

function createPicker() {
  const fixture = TestBed.createComponent(JDatePickerComponent);
  fixture.detectChanges();
  return fixture;
}

describe('JDatePickerComponent', () => {
  describe('default (English) locale', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('uses English month names and a Sunday-first week', () => {
      const picker = createPicker().componentInstance;
      expect(picker.monthNames[0]).toBe('January');
      expect(picker.firstDayOfWeek).toBe(0);
      expect(picker.dayNames[0]).toBe('Sun');
    });

    it('renders a 42-cell grid starting on the locale first day of week', () => {
      const picker = createPicker().componentInstance;
      const days = picker.calendarDays;
      expect(days).toHaveLength(42);
      expect(days[0].date.getDay()).toBe(picker.firstDayOfWeek);
    });

    it('commits and emits the selected date', () => {
      const fixture = createPicker();
      const picker = fixture.componentInstance;
      let emitted: unknown = undefined;
      picker.valueChange.subscribe((value) => (emitted = value));

      picker.selectDate(new Date(2026, 0, 15));
      expect(picker.inputValue).toBe('2026-01-15');
      expect(emitted).toBeInstanceOf(Date);
    });

    it('renders the calendar icon as a visible SVG in the trigger', () => {
      const fixture = createPicker();
      const trigger = fixture.nativeElement.querySelector(
        '.j-date-picker__trigger',
      ) as HTMLButtonElement;
      const icon = trigger.querySelector('j-icon svg path');

      expect(icon).toBeTruthy();
      expect(icon?.getAttribute('d')).toContain('M8 2v4');
    });

    it('applies reusable presets in range selection mode', () => {
      const fixture = TestBed.createComponent(JDatePickerComponent);
      fixture.componentRef.setInput('selectionMode', 'range');
      fixture.componentRef.setInput('presets', [
        {
          label: 'Release week',
          start: new Date(2026, 6, 13),
          end: new Date(2026, 6, 17),
        },
      ]);
      fixture.detectChanges();
      const picker = fixture.componentInstance;
      let emitted: unknown = undefined;
      picker.valueChange.subscribe((value) => (emitted = value));

      picker.applyPreset(picker.presets()[0]);

      expect(picker.inputValue).toBe('2026-07-13 - 2026-07-17');
      expect(emitted).toEqual([new Date(2026, 6, 13), new Date(2026, 6, 17)]);
    });
  });

  describe('Spanish locale', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({ providers: [provideJrngLocale(jLocales['es'])] }),
    );

    it('localizes month names and starts the week on Monday', () => {
      const picker = createPicker().componentInstance;
      expect(picker.monthNames[0]).toBe('Enero');
      expect(picker.firstDayOfWeek).toBe(1);
      expect(picker.dayNames[0]).toBe('Lun');
      expect(picker.calendarDays[0].date.getDay()).toBe(1);
    });
  });

  describe('time picker', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('appends the time to the value and input when showTime is on', () => {
      const fixture = TestBed.createComponent(JDatePickerComponent);
      fixture.componentRef.setInput('showTime', true);
      fixture.detectChanges();
      const picker = fixture.componentInstance;

      picker.timeHours = 9;
      picker.timeMinutes = 30;
      picker.selectDate(new Date(2026, 0, 15));

      expect(picker.inputValue).toBe('2026-01-15 09:30');
      expect(picker.selectedValue).toBeInstanceOf(Date);
      expect((picker.selectedValue as Date).getHours()).toBe(9);
      expect((picker.selectedValue as Date).getMinutes()).toBe(30);
    });

    it('changeHours wraps within 24h and re-commits the time', () => {
      const fixture = TestBed.createComponent(JDatePickerComponent);
      fixture.componentRef.setInput('showTime', true);
      fixture.detectChanges();
      const picker = fixture.componentInstance;

      picker.timeHours = 23;
      picker.selectDate(new Date(2026, 0, 15));
      picker.changeHours(1);

      expect(picker.timeHours).toBe(0);
      expect(picker.inputValue).toBe('2026-01-15 00:00');
    });

    it('12-hour format exposes display hours and meridiem', () => {
      const fixture = TestBed.createComponent(JDatePickerComponent);
      fixture.componentRef.setInput('showTime', true);
      fixture.componentRef.setInput('hourFormat', '12');
      fixture.detectChanges();
      const picker = fixture.componentInstance;

      picker.timeHours = 13;
      expect(picker.displayHours).toBe(1);
      expect(picker.meridiem).toBe('PM');
      picker.toggleMeridiem();
      expect(picker.meridiem).toBe('AM');
      expect(picker.timeHours).toBe(1);
    });

    it('includes seconds in the format when showSeconds is on', () => {
      const fixture = TestBed.createComponent(JDatePickerComponent);
      fixture.componentRef.setInput('showTime', true);
      fixture.componentRef.setInput('showSeconds', true);
      fixture.detectChanges();
      expect(fixture.componentInstance.effectiveFormat).toBe('yyyy-MM-dd HH:mm:ss');
    });
  });

  describe('selection modes', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    function makePicker(mode: 'multiple' | 'range') {
      const fixture = TestBed.createComponent(JDatePickerComponent);
      fixture.componentRef.setInput('selectionMode', mode);
      fixture.detectChanges();
      return fixture.componentInstance;
    }

    it('multiple mode toggles dates and emits an array', () => {
      const picker = makePicker('multiple');
      let emitted: unknown;
      picker.valueChange.subscribe((value) => (emitted = value));

      picker.selectDate(new Date(2026, 0, 10));
      picker.selectDate(new Date(2026, 0, 12));
      expect(picker.selectedDates).toHaveLength(2);
      expect(Array.isArray(emitted)).toBe(true);
      expect((emitted as unknown[]).length).toBe(2);

      // Selecting an existing date toggles it off.
      picker.selectDate(new Date(2026, 0, 10));
      expect(picker.selectedDates).toHaveLength(1);
      expect(picker.selectedDates[0].getDate()).toBe(12);
    });

    it('range mode sets a start then an end and formats a range', () => {
      const picker = makePicker('range');
      picker.selectDate(new Date(2026, 0, 10));
      expect(picker.selectedDates).toHaveLength(1); // partial range

      picker.selectDate(new Date(2026, 0, 15));
      expect(picker.selectedDates).toHaveLength(2);
      expect(picker.inputValue).toBe('2026-01-10 - 2026-01-15');
    });

    it('range mode orders endpoints when picked in reverse', () => {
      const picker = makePicker('range');
      picker.selectDate(new Date(2026, 0, 15));
      picker.selectDate(new Date(2026, 0, 10));
      expect(picker.selectedDates[0].getDate()).toBe(10);
      expect(picker.selectedDates[1].getDate()).toBe(15);
    });

    it('range mode marks in-between days as in-range', () => {
      const picker = makePicker('range');
      picker.selectDate(new Date(2026, 0, 10));
      picker.selectDate(new Date(2026, 0, 15));
      picker.viewDate = new Date(2026, 0, 1); // view the range's month
      const between = picker.calendarDays.find((day) => day.date.getDate() === 12 && day.inMonth);
      expect(between?.inRange).toBe(true);
    });
  });
});
