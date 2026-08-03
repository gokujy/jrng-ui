import { ComponentFixture, TestBed } from '@angular/core/testing';
import { reflectComponentType } from '@angular/core';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { JSchedulerComponent } from './scheduler.component';

describe('JSchedulerComponent', () => {
  let fixture: ComponentFixture<JSchedulerComponent>;
  let component: JSchedulerComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [JSchedulerComponent] });
    fixture = TestBed.createComponent(JSchedulerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('date', new Date(2026, 7, 5));
    fixture.detectChanges();
  });

  it('uses the production selector and OnPush standalone metadata', () => {
    const metadata = reflectComponentType(JSchedulerComponent);
    expect(metadata?.selector).toBe('j-scheduler');
    expect(metadata?.isStandalone).toBe(true);
  });

  it('renders an accessible toolbar and active view', () => {
    const root = fixture.nativeElement.querySelector('.j-scheduler') as HTMLElement;
    expect(root.getAttribute('aria-label')).toBe('Scheduler');
    expect(root.dataset['view']).toBe('month');
    expect(fixture.nativeElement.textContent).toContain('August 2026');
    expect(fixture.nativeElement.querySelector('j-scheduler-month-renderer')).toBeTruthy();
  });

  it('switches between independent standard renderers', () => {
    component.changeView('week');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('j-scheduler-time-grid-renderer')).toBeTruthy();
    component.changeView('agenda');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('j-scheduler-agenda-renderer')).toBeTruthy();
    fixture.componentRef.setInput('views', ['month', 'year']);
    component.changeView('year');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('j-scheduler-year-renderer')).toBeTruthy();
  });

  it('emits immutable controlled navigation changes', () => {
    const change = vi.fn();
    component.date.subscribe(change);
    component.next();
    expect(change).toHaveBeenCalledWith(new Date(2026, 8, 5));
  });

  it('blocks controlled changes when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    const change = vi.fn();
    component.date.subscribe(change);
    component.next();
    component.changeView('week');
    expect(change).not.toHaveBeenCalled();
    expect(component.view()).toBe('month');
  });

  it('emits event requests without mutating controlled events', () => {
    const event = {
      id: 'planning',
      title: 'Team planning',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
    };
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('events', [event]);
    const change = vi.fn();
    component.eventChange.subscribe(change);
    component.updateEvent({ ...event, title: 'Updated planning' });
    expect(change).toHaveBeenCalledOnce();
    expect(component.getEvents()[0]?.title).toBe('Team planning');
  });

  it('emits a validated final drag proposal without committing controlled data', () => {
    const event = {
      id: 'support',
      title: 'Support call',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
    };
    fixture.componentRef.setInput('view', 'week');
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('events', [event]);
    const drop = vi.fn();
    component.eventDrop.subscribe(drop);
    component.handleGestureStop(
      {
        event: {
          source: event,
          start: event.start,
          end: event.end,
          allDay: false,
          occurrenceId: 'support',
        },
        start: new Date(2026, 7, 5, 11),
        end: new Date(2026, 7, 5, 12),
        nativeEvent: new PointerEvent('pointerup'),
      },
      false,
    );
    expect(drop).toHaveBeenCalledWith(expect.objectContaining({ valid: true }));
    expect(component.getEventById('support')?.start).toEqual(new Date(2026, 7, 5, 9));
  });

  it('blocks time selection in readonly mode', () => {
    fixture.componentRef.setInput('selectable', true);
    fixture.componentRef.setInput('readonly', true);
    const select = vi.fn();
    component.dateSelect.subscribe(select);
    component.handleSlotActivate({ date: new Date(2026, 7, 5), minutes: 9 * 60 });
    expect(select).not.toHaveBeenCalled();
  });
});
