import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

    it('does not show a trigger cross by default but keeps it available as an opt-in', () => {
      const fixture = createPicker();
      fixture.componentInstance.selectDate(new Date(2026, 0, 15));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.j-date-picker__clear')).toBeNull();

      fixture.componentRef.setInput('showClear', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.j-date-picker__clear')).toBeTruthy();
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

    it('visually distinguishes selectable, out-of-range, and unavailable dates', () => {
      const fixture = TestBed.createComponent(JDatePickerComponent);
      fixture.componentRef.setInput('inline', true);
      fixture.componentRef.setInput('minDate', new Date(2026, 6, 10));
      fixture.componentRef.setInput('maxDate', new Date(2026, 6, 28));
      fixture.componentRef.setInput('disabledDates', [new Date(2026, 6, 14)]);
      fixture.detectChanges();
      const picker = fixture.componentInstance;
      picker.viewDate = new Date(2026, 6, 1);
      fixture.detectChanges();

      const inRange = picker.calendarDays.find((day) => day.inMonth && day.date.getDate() === 18);
      const outOfRange = picker.calendarDays.find((day) => day.inMonth && day.date.getDate() === 4);
      const unavailable = picker.calendarDays.find(
        (day) => day.inMonth && day.date.getDate() === 14,
      );

      expect(inRange?.disabled).toBe(false);
      expect(picker.dayClasses(inRange!)).not.toContain('is-out-of-range');
      expect(outOfRange?.disabled).toBe(true);
      expect(picker.dayClasses(outOfRange!)).toContain('is-out-of-range');
      expect(unavailable?.disabled).toBe(true);
      expect(picker.dayClasses(unavailable!)).toContain('is-unavailable');
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

    it('accepts manually entered time values and clamps them to valid ranges', () => {
      const fixture = TestBed.createComponent(JDatePickerComponent);
      fixture.componentRef.setInput('showTime', true);
      fixture.componentRef.setInput('hourFormat', '12');
      fixture.detectChanges();
      const picker = fixture.componentInstance;
      picker.timeHours = 13;

      picker.handleTimeInput('hours', {
        target: { value: '8' },
      } as unknown as Event);
      picker.handleTimeInput('minutes', {
        target: { value: '72' },
      } as unknown as Event);

      expect(picker.timeHours).toBe(20);
      expect(picker.timeMinutes).toBe(59);
    });

    it('repeats a time step while its icon button is held', () => {
      vi.useFakeTimers();
      const fixture = TestBed.createComponent(JDatePickerComponent);
      fixture.componentRef.setInput('showTime', true);
      fixture.detectChanges();
      const picker = fixture.componentInstance;
      const pointer = { preventDefault: vi.fn() } as unknown as PointerEvent;

      picker.startTimeStep('minutes', 1, pointer);
      expect(picker.timeMinutes).toBe(1);
      vi.advanceTimersByTime(540);
      picker.stopTimeStep();

      expect(picker.timeMinutes).toBeGreaterThan(1);
      vi.useRealTimers();
    });
  });

  describe('month view', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('uses MM-yyyy by default and commits immediately when a month is selected', () => {
      const fixture = TestBed.createComponent(JDatePickerComponent);
      fixture.componentRef.setInput('view', 'month');
      fixture.detectChanges();
      const picker = fixture.componentInstance;
      picker.viewDate = new Date(2028, 0, 1);
      picker.isOpen = true;

      picker.selectMonth(4);

      expect(picker.inputValue).toBe('05-2028');
      expect(picker.selectedValue).toEqual(new Date(2028, 4, 1));
      expect(picker.isOpen).toBe(false);
    });

    it('supports custom short and full month-name formats', () => {
      const fixture = TestBed.createComponent(JDatePickerComponent);
      fixture.componentRef.setInput('view', 'month');
      fixture.componentRef.setInput('dateFormat', 'MMM yyyy');
      fixture.detectChanges();
      const picker = fixture.componentInstance;
      picker.viewDate = new Date(2028, 0, 1);

      picker.selectMonth(4);
      expect(picker.inputValue).toBe('May 2028');

      fixture.componentRef.setInput('dateFormat', 'MMMM yyyy');
      picker.selectMonth(8);
      expect(picker.inputValue).toBe('September 2028');
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

describe('JDatePickerComponent disabled-state composition', () => {
  it('does not let input and form state re-enable one another', () => {
    TestBed.configureTestingModule({});
    const fixture = createPicker();
    fixture.componentInstance.setDisabledState(true);
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    expect(fixture.componentInstance.isDisabled()).toBe(true);

    fixture.componentInstance.setDisabledState(false);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.componentInstance.isDisabled()).toBe(true);
  });
});
