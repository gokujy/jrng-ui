import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, reflectComponentType } from '@angular/core';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { JSchedulerComponent } from './scheduler.component';

@Component({
  imports: [JSchedulerComponent],
  template: `
    <j-scheduler [date]="date" [events]="events" view="month" (eventClick)="clicked += 1">
      <ng-template #jSchedulerMonthEvent let-item>
        <span class="custom-event-content">{{ item.source.title }} custom</span>
      </ng-template>
    </j-scheduler>
  `,
})
class SchedulerTemplateHostComponent {
  readonly date = new Date(2026, 7, 5);
  readonly events = [
    {
      id: 'template-event',
      title: 'Template event',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
    },
  ];
  clicked = 0;
}

@Component({
  imports: [JSchedulerComponent],
  template: `
    <j-scheduler
      [date]="date"
      view="timelineWeek"
      [views]="['timelineWeek']"
      [timelineHeaderLevels]="[{ unit: 'week' }, { unit: 'day' }]"
    >
      <ng-template #jSchedulerTimelineHeader let-label let-unit="unit">
        <strong class="custom-timeline-header">{{ unit }}:{{ label }}</strong>
      </ng-template>
    </j-scheduler>
  `,
})
class SchedulerHeaderTemplateHostComponent {
  readonly date = new Date(2026, 7, 5);
}

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

  it('accepts an application-owned visible range without changing the active date', () => {
    const controlled = {
      start: new Date(2026, 7, 12),
      end: new Date(2026, 7, 15),
    };
    fixture.componentRef.setInput('visibleRange', controlled);
    fixture.detectChanges();
    expect(component.getVisibleRange()).toEqual(controlled);
    expect(component.getDate()).toEqual(new Date(2026, 7, 5));
  });

  it('renders an independently configured footer toolbar and keeps its actions functional', () => {
    fixture.componentRef.setInput('footerToolbar', {
      start: ['today'],
      center: ['title'],
      end: ['day'],
    });
    fixture.detectChanges();

    const footer = fixture.nativeElement.querySelector(
      '[data-j-slot="footer-toolbar"]',
    ) as HTMLElement;
    expect(footer).toBeTruthy();
    expect(footer.querySelector('[data-j-slot="footer-toolbar-center"]')?.textContent).toContain(
      'August 2026',
    );
    const dayButton = [...footer.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Day'),
    ) as HTMLButtonElement;
    dayButton.click();
    fixture.detectChanges();
    expect(component.view()).toBe('day');
  });

  it('renders custom toolbar buttons and accessible button groups', () => {
    const callback = vi.fn();
    const emitted = vi.fn();
    component.toolbarButtonClick.subscribe(emitted);
    fixture.componentRef.setInput('headerToolbar', {
      start: [
        {
          id: 'workflow',
          ariaLabel: 'Workflow actions',
          buttons: [
            { id: 'approve', label: 'Approve', onClick: callback },
            { id: 'hold', label: 'Hold' },
          ],
        },
      ],
      center: ['title'],
      end: [],
    });
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector(
      '[data-toolbar-group="workflow"]',
    ) as HTMLElement;
    expect(group.getAttribute('aria-label')).toBe('Workflow actions');
    (group.querySelector('[data-toolbar-button="approve"] button') as HTMLButtonElement).click();
    expect(callback).toHaveBeenCalledOnce();
    expect(emitted).toHaveBeenCalledWith('approve');
  });

  it('zooms timeline geometry within configured bounds', () => {
    fixture.componentRef.setInput('timelineSlotWidth', 80);
    fixture.componentRef.setInput('timelineMinZoom', 0.75);
    fixture.componentRef.setInput('timelineMaxZoom', 1.25);
    fixture.componentRef.setInput('timelineZoomStep', 0.25);
    component.zoomIn();
    component.zoomIn();
    expect(component.timelineZoom()).toBe(1.25);
    expect(component.effectiveTimelineSlotWidth()).toBe(100);
    component.zoomOut();
    component.zoomOut();
    component.zoomOut();
    expect(component.timelineZoom()).toBe(0.75);
    component.resetZoom();
    expect(component.timelineZoom()).toBe(1);
  });

  it('supports controlled single, additive, and range event selection with a limit', () => {
    const events = ['a', 'b', 'c'].map((id, index) => ({
      id,
      title: `Event ${id}`,
      start: new Date(2026, 7, 5, 9 + index),
      end: new Date(2026, 7, 5, 10 + index),
    }));
    fixture.componentRef.setInput('events', events);
    fixture.componentRef.setInput('eventSelection', 'multiple');
    fixture.componentRef.setInput('eventSelectionLimit', 2);
    fixture.detectChanges();
    const selected = vi.fn();
    component.eventSelectionChange.subscribe(selected);

    component.handleEventActivate({ event: events[0]!, occurrenceStart: events[0]!.start });
    component.handleEventActivate({
      event: events[2]!,
      occurrenceStart: events[2]!.start,
      nativeEvent: new MouseEvent('click', { ctrlKey: true }),
    });
    expect(component.selectedEventIds()).toEqual(['a', 'c']);

    component.handleEventActivate({
      event: events[1]!,
      occurrenceStart: events[1]!.start,
      nativeEvent: new MouseEvent('click', { shiftKey: true }),
    });
    expect(component.selectedEventIds()).toEqual(['b', 'c']);
    expect(selected).toHaveBeenLastCalledWith([events[1], events[2]]);

    fixture.componentRef.setInput('eventSelection', 'single');
    component.handleEventActivate({ event: events[0]!, occurrenceStart: events[0]!.start });
    expect(component.selectedEventIds()).toEqual(['a']);
  });

  it('projects custom event content inside the Scheduler-owned interactive shell', () => {
    const host = TestBed.createComponent(SchedulerTemplateHostComponent);
    host.detectChanges();
    const content = host.nativeElement.querySelector('.custom-event-content') as HTMLElement;
    expect(content.textContent).toContain('Template event custom');
    const shell = content.closest('button') as HTMLButtonElement;
    expect(shell.classList.contains('j-scheduler-month-event')).toBe(true);
    shell.click();
    expect(host.componentInstance.clicked).toBe(1);
  });

  it('projects typed timeline header content inside Scheduler geometry', () => {
    const host = TestBed.createComponent(SchedulerHeaderTemplateHostComponent);
    host.detectChanges();
    const content = host.nativeElement.querySelector('.custom-timeline-header') as HTMLElement;
    expect(content.textContent).toContain('week:Week');
    expect(content.closest('[data-j-slot="timeline-header"]')).toBeTruthy();
  });

  it('adapts backend-owned event records without requiring array transformation or mutation', () => {
    const source = Object.freeze({
      bookingKey: 'backend-1',
      subject: 'Adapted booking',
      beginsAt: '2026-08-05T09:00:00',
      finishesAt: '2026-08-05T10:00:00',
    });
    fixture.componentRef.setInput('eventData', [source]);
    fixture.componentRef.setInput('eventAdapter', {
      fromSource(value: object) {
        const record = value as typeof source;
        return {
          id: record.bookingKey,
          title: record.subject,
          start: new Date(record.beginsAt),
          end: new Date(record.finishesAt),
        };
      },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Adapted booking');
    expect(component.getEventById('backend-1')).toEqual(
      expect.objectContaining({ title: 'Adapted booking' }),
    );
    expect(source).toEqual(
      expect.objectContaining({ bookingKey: 'backend-1', subject: 'Adapted booking' }),
    );
  });

  it('emits event and date context for contextual actions', () => {
    const scheduledEvent = {
      id: 'context-event',
      title: 'Context event',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
      resourceId: 'room-a',
    };
    fixture.componentRef.setInput('events', [scheduledEvent]);
    fixture.componentRef.setInput('resources', [{ id: 'room-a', name: 'Room A' }]);
    fixture.detectChanges();
    const emitted = vi.fn();
    component.contextMenuShow.subscribe(emitted);
    const eventButton = fixture.nativeElement.querySelector(
      '[data-event-id="context-event"]',
    ) as HTMLButtonElement;
    eventButton.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    expect(emitted).toHaveBeenCalledWith(
      expect.objectContaining({
        event: scheduledEvent,
        date: new Date(2026, 7, 5),
      }),
    );
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

  it('renders work-week and quarter timeline views through the view registry', () => {
    fixture.componentRef.setInput('views', ['month', 'workWeek', 'timelineQuarter']);
    component.changeView('workWeek');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('j-scheduler-time-grid-renderer')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelectorAll('.j-scheduler-time-grid__header button'),
    ).toHaveLength(5);
    component.changeView('timelineQuarter');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('j-scheduler-timeline-renderer')).toBeTruthy();
    expect(component.getVisibleRange()).toEqual({
      start: new Date(2026, 6, 1),
      end: new Date(2026, 9, 1),
    });
  });

  it('supports a true single-column multi-month stack', () => {
    fixture.componentRef.setInput('views', ['multiMonth']);
    fixture.componentRef.setInput('view', 'multiMonth');
    fixture.componentRef.setInput('multiMonthLayout', 'stack');
    fixture.componentRef.setInput('multiMonthCount', 3);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.j-scheduler-year--stack')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.j-scheduler-year__month')).toHaveLength(3);
  });

  it('renders the Cartesian leaves of independent resource dimensions', () => {
    fixture.componentRef.setInput('views', ['resourceWeek']);
    fixture.componentRef.setInput('view', 'resourceWeek');
    fixture.componentRef.setInput('resourceDimensions', [
      {
        id: 'department',
        label: 'Department',
        resources: [
          { id: 'operations', name: 'Operations' },
          { id: 'support', name: 'Support' },
        ],
      },
      {
        id: 'room',
        label: 'Room',
        resources: [
          { id: 'north', name: 'North room' },
          { id: 'south', name: 'South room' },
        ],
      },
    ]);
    fixture.componentRef.setInput('events', [
      {
        id: 'dimension-event',
        title: 'Operations north',
        start: new Date(2026, 7, 5, 9),
        end: new Date(2026, 7, 5, 10),
        resourceIds: ['operations', 'north'],
      },
    ]);
    fixture.detectChanges();
    expect(component.filteredResources()).toHaveLength(2);
    expect(component.filteredResources()[0]?.children).toHaveLength(2);
    expect(fixture.nativeElement.querySelectorAll('.j-scheduler-time-grid__day')).toHaveLength(28);
    expect(fixture.nativeElement.querySelectorAll('.j-scheduler-time-event')).toHaveLength(1);
  });

  it('resolves a custom three-day view without modifying the root registry', () => {
    fixture.componentRef.setInput('views', ['month', 'custom']);
    fixture.componentRef.setInput('customViews', [
      { id: 'three-day', label: 'Three day', type: 'timeGrid', duration: { days: 3 } },
    ]);
    fixture.componentRef.setInput('customViewId', 'three-day');
    component.changeView('custom');
    fixture.detectChanges();
    expect(component.getVisibleRange()).toEqual({
      start: new Date(2026, 7, 5),
      end: new Date(2026, 7, 8),
    });
    expect(
      fixture.nativeElement.querySelectorAll('.j-scheduler-time-grid__header button'),
    ).toHaveLength(3);
  });

  it('uses custom timeline renderers and custom slot durations without changing the registry', () => {
    fixture.componentRef.setInput('views', ['custom']);
    fixture.componentRef.setInput('customViews', [
      {
        id: 'operations-window',
        label: 'Operations window',
        type: 'resourceTimeline',
        duration: { days: 2 },
        slotDuration: { minutes: 45 },
      },
    ]);
    fixture.componentRef.setInput('customViewId', 'operations-window');
    fixture.componentRef.setInput('view', 'custom');
    fixture.componentRef.setInput('resources', [{ id: 'room-a', name: 'Room A' }]);
    fixture.detectChanges();

    expect(component.viewDefinition()).toMatchObject({
      family: 'timeline',
      timeline: true,
      supportsResources: true,
    });
    expect(component.getVisibleRange()).toEqual({
      start: new Date(2026, 7, 5),
      end: new Date(2026, 7, 7),
    });
    expect(component.effectiveSlotDuration()).toBe('00:45');
    expect(component.effectiveTimelineSlotDuration()).toBe('00:45');
    expect(component.timelineSlotMinutes()).toBe(45);
    expect(fixture.nativeElement.querySelector('j-scheduler-timeline-renderer')).toBeTruthy();
  });

  it('accepts duration objects for time-grid slots and label intervals', () => {
    fixture.componentRef.setInput('view', 'day');
    fixture.componentRef.setInput('slotDuration', { minutes: 20 });
    fixture.componentRef.setInput('slotLabelInterval', { hours: 1 });
    fixture.detectChanges();

    expect(component.effectiveSlotDuration()).toBe('00:20');
    expect(component.effectiveSlotLabelInterval()).toBe('01:00');
    expect(fixture.nativeElement.querySelectorAll('.j-scheduler-time-grid__slot')).toHaveLength(72);
    expect(
      fixture.nativeElement.querySelectorAll('.j-scheduler-time-grid__labels span'),
    ).toHaveLength(24);
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

  it('removes disabled controls from keyboard interaction', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('.j-scheduler') as HTMLElement;
    expect(root.getAttribute('aria-disabled')).toBe('true');
    const controls = [...fixture.nativeElement.querySelectorAll('button')] as HTMLButtonElement[];
    expect(controls.length).toBeGreaterThan(0);
    expect(controls.every((control) => control.disabled || control.tabIndex === -1)).toBe(true);
  });

  it('mirrors the scheduler root for RTL without changing event instants', () => {
    const start = new Date(2026, 7, 5, 9);
    fixture.componentRef.setInput('rtl', true);
    fixture.componentRef.setInput('events', [
      { id: 'rtl-event', title: 'Field visit', start, end: new Date(2026, 7, 5, 10) },
    ]);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('.j-scheduler') as HTMLElement;
    expect(root.dir).toBe('rtl');
    expect(root.classList.contains('j-scheduler--rtl')).toBe(true);
    expect(component.getEventById('rtl-event')?.start).toBe(start);
  });

  it('applies controlled query, category and resource filters without mutating events', () => {
    const events = [
      {
        id: 'match',
        title: 'North room review',
        start: new Date(2026, 7, 5, 9),
        end: new Date(2026, 7, 5, 10),
        resourceId: 'north',
        categoryId: 'review',
      },
      {
        id: 'hidden',
        title: 'South room briefing',
        start: new Date(2026, 7, 5, 11),
        end: new Date(2026, 7, 5, 12),
        resourceId: 'south',
        categoryId: 'briefing',
      },
    ];
    fixture.componentRef.setInput('events', events);
    fixture.componentRef.setInput('filters', {
      query: 'review',
      resourceIds: ['north'],
      categoryIds: ['review'],
    });
    fixture.detectChanges();
    expect(component.displayedEvents().map((event) => event.source.id)).toEqual(['match']);
    expect(events).toHaveLength(2);
  });

  it('searches and sorts hierarchical resources while retaining matching ancestors', () => {
    fixture.componentRef.setInput('resources', [
      {
        id: 'operations',
        name: 'Operations',
        children: [
          { id: 'zulu', name: 'Zulu room' },
          { id: 'alpha', name: 'Alpha room' },
        ],
      },
    ]);
    fixture.componentRef.setInput('resourceSearch', 'alpha');
    fixture.componentRef.setInput('resourceSort', 'nameAsc');
    fixture.detectChanges();
    expect(component.filteredResources()).toEqual([
      expect.objectContaining({
        id: 'operations',
        children: [expect.objectContaining({ id: 'alpha' })],
      }),
    ]);
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

  it('enforces granular editing settings and emits request compatibility aliases', () => {
    const event = {
      id: 'granular',
      title: 'Granular permissions',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
    };
    fixture.componentRef.setInput('events', [event]);
    fixture.componentRef.setInput('editableSettings', {
      add: true,
      edit: false,
      remove: false,
      drag: false,
      resize: false,
    });
    const add = vi.fn();
    const addRequest = vi.fn();
    const change = vi.fn();
    const remove = vi.fn();
    component.eventAdd.subscribe(add);
    component.eventAddRequest.subscribe(addRequest);
    component.eventChangeRequest.subscribe(change);
    component.eventRemoveRequest.subscribe(remove);

    component.addEvent({ ...event, id: 'new-granular' });
    component.updateEvent({ ...event, title: 'Blocked update' });
    component.removeEvent(event.id);

    expect(add).toHaveBeenCalledOnce();
    expect(addRequest).toHaveBeenCalledWith(add.mock.calls[0]?.[0]);
    expect(change).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(component.canAddEvents()).toBe(true);
    expect(component.canDragEvents()).toBe(false);
    expect(component.canResizeEvents()).toBe(false);
  });

  it('rejects cross-resource moves when granular permissions disable them', () => {
    const event = {
      id: 'fixed-resource',
      title: 'Fixed resource',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
      resourceId: 'room-a',
    };
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('editableSettings', { moveBetweenResources: false });
    fixture.componentRef.setInput('events', [event]);
    const change = vi.fn();
    const conflict = vi.fn();
    component.eventChange.subscribe(change);
    component.conflictDetected.subscribe(conflict);

    component.handleGestureStop(
      {
        event: {
          source: event,
          occurrenceId: 'fixed-resource',
          start: event.start,
          end: event.end,
          allDay: false,
        },
        start: new Date(2026, 7, 5, 10),
        end: new Date(2026, 7, 5, 11),
        resourceId: 'room-b',
        nativeEvent: new KeyboardEvent('keydown'),
      },
      false,
    );

    expect(change).not.toHaveBeenCalled();
    expect(conflict).toHaveBeenCalledWith(
      expect.objectContaining({
        valid: false,
        reason: 'Moving events between resources is disabled.',
      }),
    );
  });

  it('opens one optional built-in editor and routes saves through controlled requests', () => {
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('builtInEditor', true);
    const add = vi.fn();
    component.eventAdd.subscribe(add);

    component.openEventEditor();
    fixture.detectChanges();

    expect(component.editorVisible()).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('j-scheduler-event-editor')).toHaveLength(1);
    component.handleEditorSave({
      event: {
        id: 'created',
        title: 'Created in editor',
        start: new Date(2026, 7, 5, 9),
        end: new Date(2026, 7, 5, 10),
      },
      previousEvent: null,
    });

    expect(add).toHaveBeenCalledOnce();
    expect(component.editorVisible()).toBe(false);
  });

  it('supports popover, dialog, drawer, and inline-expand month overflow modes', async () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    const date = new Date(2026, 7, 5);
    fixture.componentRef.setInput('events', [
      {
        id: 'overflow-a',
        title: 'Overflow A',
        start: new Date(2026, 7, 5, 9),
        end: new Date(2026, 7, 5, 10),
      },
    ]);

    for (const mode of ['popover', 'dialog', 'drawer'] as const) {
      fixture.componentRef.setInput('moreEventsMode', mode);
      fixture.detectChanges();
      component.showMore({ date, trigger });
      expect(component.moreDate()).toEqual(date);
      component.handleMoreClosed();
    }

    fixture.componentRef.setInput('moreEventsMode', 'expand');
    fixture.detectChanges();
    component.showMore({ date, trigger });
    fixture.detectChanges();
    expect(component.moreDate()).toBeNull();
    expect(component.expandedMoreDates().has('2026-08-05')).toBe(true);
    await Promise.resolve();
    expect(component.liveAnnouncement()).toContain('Expanded all events');
    trigger.remove();
  });

  it('emits an app-owned editor request when the built-in editor is disabled', () => {
    fixture.componentRef.setInput('editable', true);
    const requested = vi.fn();
    component.eventEditRequest.subscribe(requested);

    component.openEventEditor();

    expect(requested).toHaveBeenCalledWith(null);
    expect(component.editorVisible()).toBe(false);
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

  it('announces rejected gestures through the Scheduler live region', async () => {
    const event = {
      id: 'guarded',
      title: 'Guarded booking',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
    };
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('events', [event]);
    fixture.componentRef.setInput('eventChangeGuard', () => 'Approval required');
    component.handleGestureStop(
      {
        event: {
          source: event,
          start: event.start,
          end: event.end,
          allDay: false,
          occurrenceId: 'guarded',
        },
        start: new Date(2026, 7, 5, 11),
        end: new Date(2026, 7, 5, 12),
        nativeEvent: new KeyboardEvent('keydown'),
      },
      false,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.liveAnnouncement()).toBe('Move rejected: Approval required.');
    expect(fixture.nativeElement.querySelector('.j-scheduler__live').textContent).toContain(
      'Move rejected: Approval required.',
    );
  });

  it('awaits asynchronous drag validation before emitting a controlled change', async () => {
    const event = {
      id: 'remote-guard',
      title: 'Remote approval',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
    };
    let resolveGuard!: (result: boolean | string) => void;
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('events', [event]);
    fixture.componentRef.setInput(
      'eventChangeGuard',
      () => new Promise<boolean | string>((resolve) => (resolveGuard = resolve)),
    );
    const changed = vi.fn();
    component.eventChange.subscribe(changed);

    component.handleGestureStop(
      {
        event: {
          source: event,
          start: event.start,
          end: event.end,
          allDay: false,
          occurrenceId: 'remote-guard',
        },
        start: new Date(2026, 7, 5, 11),
        end: new Date(2026, 7, 5, 12),
        nativeEvent: new PointerEvent('pointerup'),
      },
      false,
    );

    expect(component.validatingChange()).toBe(true);
    expect(changed).not.toHaveBeenCalled();
    resolveGuard('Server rejected this time.');
    await fixture.whenStable();

    expect(component.validatingChange()).toBe(false);
    expect(changed).not.toHaveBeenCalled();
    expect(component.liveAnnouncement()).toBe('Move rejected: Server rejected this time.');
  });

  it('enforces resource-level mutation and booking permissions', () => {
    const event = {
      id: 'restricted',
      title: 'Restricted room',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
      resourceId: 'locked-room',
    };
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('events', [event]);
    fixture.componentRef.setInput('resources', [
      {
        id: 'locked-room',
        name: 'Locked room',
        permissions: { add: false, edit: false, remove: false, book: false },
      },
    ]);
    const added = vi.fn();
    const changed = vi.fn();
    const removed = vi.fn();
    const booked = vi.fn();
    component.eventAdd.subscribe(added);
    component.eventChange.subscribe(changed);
    component.eventRemove.subscribe(removed);
    component.slotBook.subscribe(booked);

    component.addEvent({ ...event, id: 'new-restricted' });
    component.updateEvent({ ...event, title: 'Changed' });
    component.removeEvent(event.id);
    component.handleAppointment({
      id: 'restricted-slot',
      start: new Date(2026, 7, 5, 11),
      end: new Date(2026, 7, 5, 12),
      resourceId: 'locked-room',
      status: 'available',
    });

    expect(added).not.toHaveBeenCalled();
    expect(changed).not.toHaveBeenCalled();
    expect(removed).not.toHaveBeenCalled();
    expect(booked).not.toHaveBeenCalled();
  });

  it('moves an event between resource time-grid lanes through a controlled request', () => {
    const event = {
      id: 'resource-move',
      title: 'Resource booking',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
      resourceId: 'room-a',
    };
    fixture.componentRef.setInput('view', 'resourceWeek');
    fixture.componentRef.setInput('views', ['resourceWeek']);
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('events', [event]);
    fixture.componentRef.setInput('resources', [
      { id: 'room-a', name: 'Room A' },
      { id: 'room-b', name: 'Room B' },
    ]);
    const change = vi.fn();
    component.eventChange.subscribe(change);

    component.handleGestureStop(
      {
        event: {
          source: event,
          occurrenceId: 'resource-move',
          start: event.start,
          end: event.end,
          allDay: false,
        },
        start: new Date(2026, 7, 5, 11),
        end: new Date(2026, 7, 5, 12),
        resourceId: 'room-b',
        nativeEvent: new KeyboardEvent('keydown'),
      },
      false,
    );

    expect(change).toHaveBeenCalledWith(
      expect.objectContaining({
        event: expect.objectContaining({ resourceId: 'room-b' }),
        reason: 'drag',
      }),
    );
    expect(event.resourceId).toBe('room-a');
  });

  it('wires keyboard movement between resource timeline lanes to controlled state', () => {
    const event = {
      id: 'timeline-resource-move',
      title: 'Timeline resource booking',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
      resourceId: 'room-a',
    };
    fixture.componentRef.setInput('view', 'resourceTimelineDay');
    fixture.componentRef.setInput('views', ['resourceTimelineDay']);
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('events', [event]);
    fixture.componentRef.setInput('resources', [
      { id: 'room-a', name: 'Room A' },
      { id: 'room-b', name: 'Room B' },
    ]);
    const change = vi.fn();
    component.eventChange.subscribe(change);
    fixture.detectChanges();

    const eventButton = fixture.nativeElement.querySelector(
      '[data-resource-id="room-a"] [data-event-id="timeline-resource-move"]',
    ) as HTMLButtonElement;
    eventButton.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }),
    );

    expect(change).toHaveBeenCalledWith(
      expect.objectContaining({
        event: expect.objectContaining({ resourceId: 'room-b' }),
        reason: 'drag',
      }),
    );
    expect(event.resourceId).toBe('room-a');
  });

  it('moves Month events between dates through the controlled drag proposal', () => {
    const event = {
      id: 'month-move',
      title: 'Operations review',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 6, 10),
      allDay: true,
    };
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
          allDay: true,
          occurrenceId: 'month-move',
        },
        start: new Date(2026, 7, 8, 9),
        end: new Date(2026, 7, 9, 10),
        nativeEvent: new PointerEvent('pointerup'),
      },
      false,
    );

    expect(drop).toHaveBeenCalledWith(
      expect.objectContaining({
        valid: true,
        start: new Date(2026, 7, 8, 9),
        end: new Date(2026, 7, 9, 10),
        view: 'month',
      }),
    );
    expect(component.getEventById('month-move')?.start).toBe(event.start);
  });

  it('resizes Month event spans through the controlled resize proposal', () => {
    const event = {
      id: 'month-resize',
      title: 'Maintenance window',
      start: new Date(2026, 7, 5),
      end: new Date(2026, 7, 7),
      allDay: true,
    };
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('events', [event]);
    const resizeStop = vi.fn();
    const change = vi.fn();
    component.eventResizeStop.subscribe(resizeStop);
    component.eventChange.subscribe(change);

    component.handleGestureStop(
      {
        event: {
          source: event,
          start: event.start,
          end: event.end,
          allDay: true,
          occurrenceId: 'month-resize',
        },
        start: event.start,
        end: new Date(2026, 7, 10),
        nativeEvent: new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          altKey: true,
          shiftKey: true,
        }),
      },
      true,
    );

    expect(resizeStop).toHaveBeenCalledWith(
      expect.objectContaining({ valid: true, end: new Date(2026, 7, 10), view: 'month' }),
    );
    expect(change).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'resize', previousEvent: event }),
    );
    expect(component.getEventById('month-resize')?.end).toBe(event.end);
  });

  it('resizes from the start edge only when the granular capability is enabled', () => {
    const event = {
      id: 'start-resize',
      title: 'Preparation window',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 11),
    };
    fixture.componentRef.setInput('events', [event]);
    fixture.componentRef.setInput('editableSettings', { resize: true, resizeFromStart: true });
    const change = vi.fn();
    component.eventChangeRequest.subscribe(change);

    component.handleGestureStop(
      {
        event: {
          source: event,
          start: event.start,
          end: event.end,
          allDay: false,
          occurrenceId: 'start-resize',
        },
        start: new Date(2026, 7, 5, 8, 30),
        end: event.end,
        edge: 'start',
        nativeEvent: new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          altKey: true,
          shiftKey: true,
          ctrlKey: true,
        }),
      },
      true,
    );

    expect(change).toHaveBeenCalledWith(
      expect.objectContaining({
        event: expect.objectContaining({ start: new Date(2026, 7, 5, 8, 30) }),
        previousEvent: event,
        reason: 'resize',
      }),
    );
  });

  it('blocks time selection in readonly mode', () => {
    fixture.componentRef.setInput('selectable', true);
    fixture.componentRef.setInput('readonly', true);
    const select = vi.fn();
    component.dateSelect.subscribe(select);
    component.handleSlotActivate({ date: new Date(2026, 7, 5), minutes: 9 * 60 });
    expect(select).not.toHaveBeenCalled();
  });

  it('creates a guarded Shift time range and highlights only intersecting slots', async () => {
    fixture.componentRef.setInput('view', 'day');
    fixture.componentRef.setInput('views', ['day']);
    fixture.componentRef.setInput('selectable', true);
    fixture.componentRef.setInput('dateSelectionMode', 'timeRange');
    fixture.componentRef.setInput('selectionGuard', (selection: { start: Date }) =>
      selection.start.getHours() < 8 ? 'Too early.' : true,
    );
    fixture.detectChanges();
    const selected = vi.fn();
    component.dateSelect.subscribe(selected);

    component.handleSlotActivate({ date: new Date(2026, 7, 5), minutes: 9 * 60 });
    component.handleSlotActivate({
      date: new Date(2026, 7, 5),
      minutes: 10 * 60,
      nativeEvent: new MouseEvent('click', { shiftKey: true }),
    });
    fixture.detectChanges();

    expect(selected).toHaveBeenLastCalledWith(
      expect.objectContaining({
        start: new Date(2026, 7, 5, 9),
        end: new Date(2026, 7, 5, 10, 30),
      }),
    );
    expect(
      fixture.nativeElement.querySelectorAll('[data-selected="true"][data-j-time]'),
    ).toHaveLength(3);
    expect(
      fixture.nativeElement.querySelector('[data-j-time="11:00"]')?.getAttribute('data-selected'),
    ).toBeNull();

    component.handleSlotActivate({ date: new Date(2026, 7, 5), minutes: 7 * 60 });
    await fixture.whenStable();
    expect(component.liveAnnouncement()).toContain('Too early');
  });

  it('serializes state and exposes import/export as immutable previews', () => {
    const event = {
      id: 'portable',
      title: 'Portable event',
      start: new Date('2026-08-05T09:00:00Z'),
      end: new Date('2026-08-05T10:00:00Z'),
    };
    fixture.componentRef.setInput('events', [event]);
    fixture.componentRef.setInput('selectedEventIds', ['portable']);
    const state = component.serializeState();
    expect(state).toMatchObject({ schemaVersion: 1, view: 'month' });
    expect(component.exportToICS()).toContain('UID:portable');
    expect(component.exportToExcel()).toContain('<Workbook');
    expect(Array.from(component.exportToXLSX().slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect(new TextDecoder().decode(component.exportToPDF())).toContain('%PDF-1.4');
    const preview = component.importData(component.exportToJSON());
    expect(preview.errors).toEqual([]);
    expect(preview.events[0]?.start).toEqual(event.start);
    expect(component.getEvents()[0]).toBe(event);
  });

  it('copies and pastes selected events without mutating controlled inputs', () => {
    const events = [
      {
        id: 'copy-a',
        title: 'First',
        start: new Date(2026, 7, 5, 9),
        end: new Date(2026, 7, 5, 10),
      },
      {
        id: 'copy-b',
        title: 'Second',
        start: new Date(2026, 7, 5, 11),
        end: new Date(2026, 7, 5, 12),
      },
    ];
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('events', events);
    fixture.componentRef.setInput(
      'selectedEventIds',
      events.map((event) => event.id),
    );
    const add = vi.fn();
    component.eventAdd.subscribe(add);

    component.copyEvents();
    const pasted = component.pasteEvents({ start: new Date(2026, 7, 8, 13), resourceId: 'room-2' });

    expect(pasted.map((event) => event.start.getHours())).toEqual([13, 15]);
    expect(add).toHaveBeenCalledTimes(2);
    expect(events[0]?.start).toEqual(new Date(2026, 7, 5, 9));
  });

  it('emits inverse controlled requests for optional local undo and redo', () => {
    const event = {
      id: 'history',
      title: 'History event',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
    };
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('historyEnabled', true);
    fixture.componentRef.setInput('events', [event]);
    const change = vi.fn();
    component.eventChange.subscribe(change);

    component.updateEvent({ ...event, title: 'Updated' });
    expect(component.canUndo()).toBe(true);
    component.undo();
    expect(change).toHaveBeenLastCalledWith(expect.objectContaining({ event, reason: 'update' }));
    expect(component.canRedo()).toBe(true);
    component.redo();
    expect(change).toHaveBeenLastCalledWith(
      expect.objectContaining({ event: expect.objectContaining({ title: 'Updated' }) }),
    );
  });

  it('emits cancellable server-owned visible and adjacent range requests', async () => {
    const requests: { requestId: string; prefetch: boolean; signal: AbortSignal }[] = [];
    component.visibleRangeRequest.subscribe((request) => requests.push(request));
    fixture.componentRef.setInput('view', 'week');
    fixture.componentRef.setInput('date', new Date(2026, 7, 5));
    fixture.componentRef.setInput('remotePrefetch', true);
    fixture.componentRef.setInput('remoteData', true);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise<void>((resolve) => queueMicrotask(resolve));

    expect(requests).toHaveLength(3);
    expect(requests.filter((request) => request.prefetch)).toHaveLength(2);
    component.completeRangeRequest(requests[0]!.requestId);

    const previousSignal = requests[0]!.signal;
    fixture.componentRef.setInput('date', new Date(2026, 7, 12));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(previousSignal.aborted).toBe(true);
  });

  it('proposes grouped cross-scheduler drops and accessible bulk moves', () => {
    const events = [
      {
        id: 'external-a',
        title: 'A',
        start: new Date(2026, 7, 5, 9),
        end: new Date(2026, 7, 5, 10),
      },
      {
        id: 'external-b',
        title: 'B',
        start: new Date(2026, 7, 5, 11),
        end: new Date(2026, 7, 5, 12),
      },
    ];
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('schedulerId', 'target');
    fixture.componentRef.setInput('events', events);
    const changes = vi.fn();
    const drops = vi.fn();
    component.eventChange.subscribe(changes);
    component.externalDrop.subscribe(drops);

    const payload = component.createExternalDragPayload(
      events.map((event) => event.id),
      true,
    )!;
    const drop = component.receiveExternalDrop(payload, {
      start: new Date(2026, 7, 8, 13),
      resourceId: 'room-b',
    });
    expect(drop.valid).toBe(true);
    expect(drop.proposedEvents.map((event) => event.start.getHours())).toEqual([13, 15]);
    expect(drops).toHaveBeenCalledWith(drop);

    const moved = component.moveEvents(
      events.map((event) => event.id),
      {
        start: new Date(2026, 7, 9, 9),
      },
    );
    expect(moved).toHaveLength(2);
    expect(changes).toHaveBeenCalledTimes(2);
    expect(events[0]?.start).toEqual(new Date(2026, 7, 5, 9));
  });

  it('transfers a touch pointer drop between registered Scheduler instances', async () => {
    const destinationFixture = TestBed.createComponent(JSchedulerComponent);
    destinationFixture.componentRef.setInput('date', new Date(2026, 7, 5));
    destinationFixture.componentRef.setInput('view', 'day');
    destinationFixture.componentRef.setInput('views', ['day']);
    destinationFixture.componentRef.setInput('editable', true);
    destinationFixture.componentRef.setInput('externalDropEnabled', true);
    destinationFixture.componentRef.setInput('schedulerId', 'destination');
    destinationFixture.detectChanges();

    const event = {
      id: 'touch-transfer',
      title: 'Touch transfer',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
    };
    fixture.componentRef.setInput('date', new Date(2026, 7, 5));
    fixture.componentRef.setInput('view', 'day');
    fixture.componentRef.setInput('views', ['day']);
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('externalDrag', true);
    fixture.componentRef.setInput('schedulerId', 'source');
    fixture.componentRef.setInput('events', [event]);
    fixture.detectChanges();

    const target = destinationFixture.nativeElement.querySelector(
      '[data-j-time="10:00"]',
    ) as HTMLElement;
    const original = Object.getOwnPropertyDescriptor(document, 'elementFromPoint');
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: vi.fn(() => target),
    });
    const dropped = vi.fn();
    destinationFixture.componentInstance.externalDrop.subscribe(dropped);

    component.handleGestureStop(
      {
        event: {
          source: event,
          start: event.start,
          end: event.end,
          allDay: false,
          occurrenceId: 'touch-transfer',
        },
        start: event.start,
        end: event.end,
        nativeEvent: new PointerEvent('pointerup', {
          clientX: 120,
          clientY: 240,
          pointerType: 'touch',
        }),
      },
      false,
    );
    await destinationFixture.whenStable();

    expect(dropped).toHaveBeenCalledWith(
      expect.objectContaining({
        valid: true,
        payload: expect.objectContaining({ sourceSchedulerId: 'source' }),
        proposedEvents: [expect.objectContaining({ start: new Date(2026, 7, 5, 10) })],
      }),
    );
    expect(event.start).toEqual(new Date(2026, 7, 5, 9));

    if (original) Object.defineProperty(document, 'elementFromPoint', original);
    else Reflect.deleteProperty(document, 'elementFromPoint');
    destinationFixture.destroy();
  });

  it('moves selected events through the non-drag dialog without mutating inputs', () => {
    const events = [
      {
        id: 'move-a',
        title: 'Move A',
        start: new Date(2026, 7, 5, 9),
        end: new Date(2026, 7, 5, 10),
      },
      {
        id: 'move-b',
        title: 'Move B',
        start: new Date(2026, 7, 5, 11),
        end: new Date(2026, 7, 5, 12),
      },
    ];
    fixture.componentRef.setInput('editable', true);
    fixture.componentRef.setInput('events', events);
    fixture.componentRef.setInput(
      'selectedEventIds',
      events.map((event) => event.id),
    );
    const changes = vi.fn();
    component.eventChange.subscribe(changes);

    component.openMoveDialog();
    expect(component.moveDialogVisible()).toBe(true);
    component.moveDate.set(new Date(2026, 7, 8));
    component.moveTime.set('14:30');
    const moved = component.confirmMoveDialog();

    expect(moved.map((event) => new Date(event.start).getHours())).toEqual([14, 16]);
    expect(changes).toHaveBeenCalledTimes(2);
    expect(component.moveDialogVisible()).toBe(false);
    expect(events[0]?.start).toEqual(new Date(2026, 7, 5, 9));
  });
});
