import { reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JCalendarSchedulerComponent } from './calendar-scheduler.component';

describe('JCalendarSchedulerComponent', () => {
  const metadata = reflectComponentType(JCalendarSchedulerComponent);
  let fixture: ComponentFixture<JCalendarSchedulerComponent>;
  let component: JCalendarSchedulerComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [JCalendarSchedulerComponent] });
    fixture = TestBed.createComponent(JCalendarSchedulerComponent);
    component = fixture.componentInstance;
  });

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-calendar-scheduler');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('falls back safely when an invalid active date is supplied', () => {
    fixture.componentRef.setInput('activeDate', new Date('invalid'));
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(Number.isFinite(component.resolvedActiveDate().getTime())).toBe(true);
    expect(component.visibleDays()).toHaveLength(42);
  });

  it('ignores events with invalid date ranges', () => {
    fixture.componentRef.setInput('activeDate', new Date(2026, 0, 15));
    fixture.componentRef.setInput('events', [
      { id: 'invalid', title: 'Invalid event', start: 'not-a-date' },
    ]);
    fixture.detectChanges();
    expect(component.visibleDays().flatMap((day) => day.events)).toEqual([]);
  });

  it('moves end-of-month anchors without skipping a month', () => {
    fixture.componentRef.setInput('activeDate', new Date(2026, 0, 31));
    fixture.detectChanges();
    component.next();
    expect(component.activeDate().getMonth()).toBe(1);
  });

  it('rejects unsupported values from the native view selector', () => {
    fixture.detectChanges();
    component.setView({ target: { value: 'year' } } as unknown as Event);
    expect(component.view()).toBe('month');
  });
});
