import { reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JGanttComponent } from './gantt.component';

describe('JGanttComponent', () => {
  const metadata = reflectComponentType(JGanttComponent);
  let fixture: ComponentFixture<JGanttComponent>;
  let component: JGanttComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [JGanttComponent] });
    fixture = TestBed.createComponent(JGanttComponent);
    component = fixture.componentInstance;
  });

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-gantt');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('normalizes reversed explicit ranges', () => {
    fixture.componentRef.setInput('start', '2026-06-01');
    fixture.componentRef.setInput('end', '2026-01-01');
    expect(component.range().start.getTime()).toBeLessThanOrEqual(component.range().end.getTime());
  });

  it('keeps invalid task dates and progress from producing NaN layout', () => {
    fixture.componentRef.setInput('tasks', [
      {
        id: 'invalid',
        label: 'Invalid task',
        start: 'not-a-date',
        end: 'also-invalid',
        progress: Number.NaN,
      },
    ]);
    fixture.detectChanges();
    const view = component.taskViews()[0]!;
    expect(Number.isFinite(view.left)).toBe(true);
    expect(Number.isFinite(view.width)).toBe(true);
    expect(component.progress(component.tasks()[0]!)).toBe(0);
  });

  it('generates consecutive month slots from end-of-month ranges', () => {
    fixture.componentRef.setInput('scale', 'month');
    fixture.componentRef.setInput('start', new Date(2026, 0, 31));
    fixture.componentRef.setInput('end', new Date(2026, 2, 31));
    expect(component.timelineSlots().map((slot) => slot.date.getMonth())).toEqual([0, 1, 2]);
  });
});
