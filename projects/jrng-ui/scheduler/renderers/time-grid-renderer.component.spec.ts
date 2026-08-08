import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JSchedulerTimeGridRendererComponent } from './time-grid-renderer.component';

describe('JSchedulerTimeGridRendererComponent resource grouping', () => {
  let fixture: ComponentFixture<JSchedulerTimeGridRendererComponent>;
  let component: JSchedulerTimeGridRendererComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [JSchedulerTimeGridRendererComponent] });
    fixture = TestBed.createComponent(JSchedulerTimeGridRendererComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('range', {
      start: new Date(2026, 7, 3),
      end: new Date(2026, 7, 5),
    });
    fixture.componentRef.setInput('resources', [
      {
        id: 'team',
        name: 'Operations',
        children: [
          { id: 'room-a', name: 'Room A' },
          { id: 'room-b', name: 'Room B' },
        ],
      },
    ]);
    fixture.componentRef.setInput('events', [
      {
        source: {
          id: 'a',
          title: 'Room A booking',
          start: new Date(2026, 7, 3, 9),
          end: new Date(2026, 7, 3, 10),
          resourceId: 'room-a',
        },
        occurrenceId: 'a',
        start: new Date(2026, 7, 3, 9),
        end: new Date(2026, 7, 3, 10),
        allDay: false,
      },
    ]);
    fixture.detectChanges();
  });

  it('separates thirty-minute slots from configurable label intervals', () => {
    expect(
      fixture.nativeElement.querySelectorAll('.j-scheduler-time-grid__labels span'),
    ).toHaveLength(48);

    fixture.componentRef.setInput('slotLabelInterval', '01:00');
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll('.j-scheduler-time-grid__labels span'),
    ).toHaveLength(24);
    expect(
      fixture.nativeElement.querySelectorAll('.j-scheduler-time-grid__slot--hour'),
    ).toHaveLength(96);
  });

  it('uses roving slot focus for arrow and page keyboard navigation', async () => {
    const first = fixture.nativeElement.querySelector(
      '.j-scheduler-time-grid__slot[tabindex="0"]',
    ) as HTMLButtonElement;
    expect(first).toBeTruthy();
    expect(
      fixture.nativeElement.querySelectorAll('.j-scheduler-time-grid__slot[tabindex="0"]'),
    ).toHaveLength(1);
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect((document.activeElement as HTMLElement).dataset['focusKey']).toContain('|30');
  });

  it('renders every date and leaf resource as a distinct vertical lane', () => {
    expect(component.lanes()).toHaveLength(4);
    expect(fixture.nativeElement.querySelectorAll('.j-scheduler-time-grid__day')).toHaveLength(4);
    expect(
      fixture.nativeElement.querySelectorAll('[data-resource-id="room-a"] .j-scheduler-time-event'),
    ).toHaveLength(1);
    expect(
      fixture.nativeElement.querySelectorAll('[data-resource-id="room-b"] .j-scheduler-time-event'),
    ).toHaveLength(0);
  });

  it('optionally renders parent aggregate columns with descendant events', () => {
    fixture.componentRef.setInput('resourceAggregateColumns', true);
    fixture.detectChanges();
    expect(component.lanes()).toHaveLength(6);
    const aggregateColumns = fixture.nativeElement.querySelectorAll(
      '.j-scheduler-time-grid__day[data-aggregate="true"]',
    );
    expect(aggregateColumns).toHaveLength(2);
    expect(aggregateColumns[0]?.querySelectorAll('.j-scheduler-time-event')).toHaveLength(1);
  });

  it('renders appointment availability in a separate accessible lane', () => {
    fixture.componentRef.setInput('appointmentDisplay', 'lane');
    fixture.componentRef.setInput('appointmentSlots', [
      {
        id: 'slot-a',
        start: new Date(2026, 7, 3, 9),
        end: new Date(2026, 7, 3, 9, 30),
        resourceId: 'room-a',
        status: 'available',
      },
    ]);
    fixture.detectChanges();

    const lane = fixture.nativeElement.querySelector('[data-j-slot="appointment-lane"]');
    expect(lane?.getAttribute('aria-label')).toBe('Appointment availability');
    expect(lane?.querySelector('[data-slot-id="slot-a"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.j-scheduler-time-grid__appointment')).toBeNull();
  });

  it('renders global and resource-specific working calendars behind slots', () => {
    fixture.componentRef.setInput('businessHours', [
      { daysOfWeek: [1], startTime: '08:00', endTime: '17:00' },
    ]);
    fixture.componentRef.setInput('availability', [
      {
        resourceId: 'room-a',
        daysOfWeek: [1],
        startTime: '09:00',
        endTime: '12:00',
        label: 'Bookable',
      },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-j-slot="business-hours"]')).toHaveLength(
      2,
    );
    expect(
      fixture.nativeElement.querySelectorAll('[data-j-slot="availability"][aria-label="Bookable"]'),
    ).toHaveLength(1);
  });

  it('renders the current-time marker only in matching date lanes', () => {
    fixture.componentRef.setInput('now', new Date(2026, 7, 3, 10, 15));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-j-slot="now-indicator"]')).toHaveLength(2);
  });

  it('emits the resource identity when a lane slot is selected', () => {
    const selected = vi.fn();
    component.slotActivate.subscribe(selected);
    const slot = fixture.nativeElement.querySelector(
      '.j-scheduler-time-grid__day[data-resource-id="room-b"] .j-scheduler-time-grid__slot',
    ) as HTMLButtonElement;
    slot.click();
    expect(selected).toHaveBeenCalledWith(
      expect.objectContaining({ resourceId: 'room-b', minutes: 0 }),
    );
  });

  it('renders background events behind lanes without creating interactive event cards', () => {
    fixture.componentRef.setInput('resources', []);
    fixture.componentRef.setInput('events', [
      {
        source: {
          id: 'availability',
          title: 'Availability',
          start: new Date(2026, 7, 3, 9),
          end: new Date(2026, 7, 3, 12),
          display: 'background',
        },
        occurrenceId: 'availability',
        start: new Date(2026, 7, 3, 9),
        end: new Date(2026, 7, 3, 12),
        allDay: false,
      },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-j-slot="background-event"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.j-scheduler-time-event')).toBeNull();
  });

  it('moves and resizes timed events with the keyboard while respecting event permissions', () => {
    fixture.componentRef.setInput('draggable', true);
    fixture.componentRef.setInput('resizable', true);
    const drag = vi.fn();
    const resize = vi.fn();
    component.dragStop.subscribe(drag);
    component.resizeStop.subscribe(resize);
    fixture.detectChanges();
    const event = fixture.nativeElement.querySelector(
      '[data-event-id="a"] .j-scheduler-time-event__content',
    ) as HTMLButtonElement;

    event.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }),
    );
    event.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        altKey: true,
        shiftKey: true,
        bubbles: true,
      }),
    );

    expect(drag).toHaveBeenCalledWith(
      expect.objectContaining({ start: new Date(2026, 7, 3, 9, 15) }),
    );
    expect(resize).toHaveBeenCalledWith(
      expect.objectContaining({ end: new Date(2026, 7, 3, 10, 15) }),
    );

    fixture.componentRef.setInput('events', [
      {
        ...component.events()[0]!,
        source: { ...component.events()[0]!.source, readonly: true },
      },
    ]);
    fixture.detectChanges();
    const readonlyEvent = fixture.nativeElement.querySelector(
      '[data-event-id="a"] .j-scheduler-time-event__content',
    ) as HTMLButtonElement;
    readonlyEvent.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }),
    );
    expect(drag).toHaveBeenCalledTimes(1);
  });
});
