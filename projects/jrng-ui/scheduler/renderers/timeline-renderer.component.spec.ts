import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { JSchedulerTimelineRendererComponent } from './timeline-renderer.component';

describe('JSchedulerTimelineRendererComponent', () => {
  it('renders descendant events in an explicitly marked parent aggregate row', async () => {
    await TestBed.configureTestingModule({
      imports: [JSchedulerTimelineRendererComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(JSchedulerTimelineRendererComponent);
    fixture.componentRef.setInput('view', 'resourceTimelineDay');
    fixture.componentRef.setInput('range', {
      start: new Date(2026, 7, 5),
      end: new Date(2026, 7, 6),
    });
    fixture.componentRef.setInput('resources', [
      {
        id: 'department',
        name: 'Department',
        children: [{ id: 'room', name: 'Room' }],
      },
    ]);
    fixture.componentRef.setInput('events', [
      {
        source: {
          id: 'booking',
          title: 'Booking',
          start: new Date(2026, 7, 5, 9),
          end: new Date(2026, 7, 5, 10),
          resourceId: 'room',
        },
        occurrenceId: 'booking',
        start: new Date(2026, 7, 5, 9),
        end: new Date(2026, 7, 5, 10),
        allDay: false,
      },
    ]);
    fixture.detectChanges();

    const aggregate = fixture.nativeElement.querySelector(
      '[data-resource-id="department"][data-aggregate="true"]',
    ) as HTMLElement;
    expect(aggregate).toBeTruthy();
    expect(aggregate.querySelector('[data-event-id="booking"]')).toBeTruthy();
  });

  it('renders bounded row and time windows for large resource timelines', async () => {
    await TestBed.configureTestingModule({
      imports: [JSchedulerTimelineRendererComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(JSchedulerTimelineRendererComponent);
    fixture.componentRef.setInput('view', 'timelineDay');
    fixture.componentRef.setInput('range', {
      start: new Date(2026, 7, 5),
      end: new Date(2026, 7, 6),
    });
    fixture.componentRef.setInput(
      'resources',
      Array.from({ length: 500 }, (_, index) => ({ id: index, name: `Resource ${index}` })),
    );
    fixture.componentRef.setInput('resourceVirtualThreshold', 20);
    fixture.componentRef.setInput('virtualThreshold', 10);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.viewportHeight.set(260);
    component.scrollTop.set(5_200);
    component.viewportWidth.set(360);
    component.scrollLeft.set(720);

    expect(component.rowWindow().items.length).toBeLessThan(20);
    expect(component.rowWindow().startIndex).toBeGreaterThan(0);
    expect(component.window().items.length).toBeLessThan(component.slots().length);
    expect(
      fixture.nativeElement.querySelectorAll('[data-j-slot="resource-lane"]').length,
    ).toBeLessThan(20);
  });

  it('emits controlled resource reorder requests from the keyboard', async () => {
    await TestBed.configureTestingModule({
      imports: [JSchedulerTimelineRendererComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(JSchedulerTimelineRendererComponent);
    fixture.componentRef.setInput('view', 'resourceTimelineDay');
    fixture.componentRef.setInput('range', {
      start: new Date(2026, 7, 5),
      end: new Date(2026, 7, 6),
    });
    const resources = [
      { id: 'north', name: 'North room' },
      { id: 'south', name: 'South room' },
    ];
    fixture.componentRef.setInput('resources', resources);
    fixture.componentRef.setInput('resourceDraggable', true);
    const moved = vi.fn();
    fixture.componentInstance.resourceMove.subscribe(moved);
    fixture.detectChanges();

    const south = fixture.nativeElement.querySelector(
      '.j-scheduler-timeline__resource[data-resource-id="south"] .j-scheduler-timeline__resource-name',
    ) as HTMLButtonElement;
    south.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true, bubbles: true }),
    );
    expect(moved).toHaveBeenCalledWith(
      expect.objectContaining({
        resource: resources[1],
        target: resources[0],
        position: 'before',
      }),
    );
    expect(resources.map((resource) => resource.id)).toEqual(['north', 'south']);
  });

  it('emits snapped timeline drag and resize proposals from the keyboard', async () => {
    await TestBed.configureTestingModule({
      imports: [JSchedulerTimelineRendererComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(JSchedulerTimelineRendererComponent);
    fixture.componentRef.setInput('view', 'resourceTimelineDay');
    fixture.componentRef.setInput('range', {
      start: new Date(2026, 7, 5),
      end: new Date(2026, 7, 6),
    });
    fixture.componentRef.setInput('resources', [{ id: 'room', name: 'Room' }]);
    fixture.componentRef.setInput('events', [
      {
        source: {
          id: 'booking',
          title: 'Booking',
          start: new Date(2026, 7, 5, 9),
          end: new Date(2026, 7, 5, 10),
          resourceId: 'room',
        },
        occurrenceId: 'booking',
        start: new Date(2026, 7, 5, 9),
        end: new Date(2026, 7, 5, 10),
        allDay: false,
      },
    ]);
    fixture.componentRef.setInput('draggable', true);
    fixture.componentRef.setInput('resizable', true);
    fixture.componentRef.setInput('snapMinutes', 30);
    const dragged = vi.fn();
    const resized = vi.fn();
    fixture.componentInstance.dragStop.subscribe(dragged);
    fixture.componentInstance.resizeStop.subscribe(resized);
    fixture.detectChanges();
    const event = fixture.nativeElement.querySelector(
      '[data-resource-id="room"] [data-event-id="booking"]',
    ) as HTMLButtonElement;
    event.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }),
    );
    event.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        altKey: true,
        shiftKey: true,
        bubbles: true,
      }),
    );
    expect(dragged).toHaveBeenCalledWith(
      expect.objectContaining({ start: new Date(2026, 7, 5, 9, 30) }),
    );
    expect(resized).toHaveBeenCalledWith(
      expect.objectContaining({
        start: new Date(2026, 7, 5, 9),
        end: new Date(2026, 7, 5, 10, 30),
      }),
    );
  });

  it('moves an event between timeline resource lanes with the keyboard', async () => {
    await TestBed.configureTestingModule({
      imports: [JSchedulerTimelineRendererComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(JSchedulerTimelineRendererComponent);
    fixture.componentRef.setInput('view', 'resourceTimelineDay');
    fixture.componentRef.setInput('range', {
      start: new Date(2026, 7, 5),
      end: new Date(2026, 7, 6),
    });
    fixture.componentRef.setInput('resources', [
      { id: 'north', name: 'North room' },
      { id: 'south', name: 'South room' },
    ]);
    fixture.componentRef.setInput('events', [
      {
        source: {
          id: 'booking',
          title: 'Booking',
          start: new Date(2026, 7, 5, 9),
          end: new Date(2026, 7, 5, 10),
          resourceId: 'north',
        },
        occurrenceId: 'booking',
        start: new Date(2026, 7, 5, 9),
        end: new Date(2026, 7, 5, 10),
        allDay: false,
      },
    ]);
    fixture.componentRef.setInput('draggable', true);
    const dragged = vi.fn();
    fixture.componentInstance.dragStop.subscribe(dragged);
    fixture.detectChanges();

    const event = fixture.nativeElement.querySelector(
      '[data-resource-id="north"] [data-event-id="booking"]',
    ) as HTMLButtonElement;
    event.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }),
    );

    expect(dragged).toHaveBeenCalledWith(expect.objectContaining({ resourceId: 'south' }));
  });

  it('keeps pointer resource targeting aligned when the timeline scrolls during a drag', async () => {
    await TestBed.configureTestingModule({
      imports: [JSchedulerTimelineRendererComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(JSchedulerTimelineRendererComponent);
    fixture.componentRef.setInput('view', 'resourceTimelineDay');
    fixture.componentRef.setInput('range', {
      start: new Date(2026, 7, 5),
      end: new Date(2026, 7, 6),
    });
    fixture.componentRef.setInput('resources', [
      { id: 'north', name: 'North room' },
      { id: 'south', name: 'South room' },
    ]);
    fixture.componentRef.setInput('events', [
      {
        source: {
          id: 'booking',
          title: 'Booking',
          start: new Date(2026, 7, 5, 9),
          end: new Date(2026, 7, 5, 10),
          resourceId: 'north',
        },
        occurrenceId: 'booking',
        start: new Date(2026, 7, 5, 9),
        end: new Date(2026, 7, 5, 10),
        allDay: false,
      },
    ]);
    fixture.componentRef.setInput('draggable', true);
    const dragged = vi.fn();
    fixture.componentInstance.dragStop.subscribe(dragged);
    fixture.detectChanges();
    const event = fixture.nativeElement.querySelector(
      '[data-resource-id="north"] [data-event-id="booking"]',
    ) as HTMLButtonElement;

    event.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 7,
        button: 0,
        clientX: 300,
        clientY: 100,
        bubbles: true,
      }),
    );
    fixture.componentInstance.scrollTop.set(fixture.componentInstance.resourceRowHeight());
    event.dispatchEvent(
      new PointerEvent('pointerup', {
        pointerId: 7,
        button: 0,
        clientX: 300,
        clientY: 100,
        bubbles: true,
      }),
    );

    expect(dragged).toHaveBeenCalledWith(expect.objectContaining({ resourceId: 'south' }));
  });

  it('positions a current-time marker within the visible timeline range', async () => {
    await TestBed.configureTestingModule({
      imports: [JSchedulerTimelineRendererComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(JSchedulerTimelineRendererComponent);
    fixture.componentRef.setInput('view', 'timelineDay');
    fixture.componentRef.setInput('range', {
      start: new Date(2026, 7, 5),
      end: new Date(2026, 7, 6),
    });
    fixture.componentRef.setInput('now', new Date(2026, 7, 5, 12));
    fixture.detectChanges();

    const marker = fixture.nativeElement.querySelector(
      '[data-j-slot="now-indicator"]',
    ) as HTMLElement;
    expect(marker).toBeTruthy();
    expect(Number.parseFloat(marker.style.insetInlineStart)).toBeGreaterThan(0);
  });

  it('renders grouped multi-level headers for a week timeline', async () => {
    await TestBed.configureTestingModule({
      imports: [JSchedulerTimelineRendererComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(JSchedulerTimelineRendererComponent);
    fixture.componentRef.setInput('view', 'timelineWeek');
    fixture.componentRef.setInput('range', {
      start: new Date(2026, 7, 3),
      end: new Date(2026, 7, 10),
    });
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(
      '.j-scheduler-timeline__header-row',
    ) as NodeListOf<HTMLElement>;
    expect(rows.length).toBe(3);
    expect(Array.from(rows, (row) => row.dataset['headerUnit'])).toEqual(['month', 'week', 'day']);
  });

  it('honors custom timeline header levels and date formats', async () => {
    await TestBed.configureTestingModule({
      imports: [JSchedulerTimelineRendererComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(JSchedulerTimelineRendererComponent);
    fixture.componentRef.setInput('view', 'timelineMonth');
    fixture.componentRef.setInput('range', {
      start: new Date(2026, 7, 1),
      end: new Date(2026, 8, 1),
    });
    fixture.componentRef.setInput('headerLevels', [
      { unit: 'year', format: { year: '2-digit' } },
      { unit: 'week' },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.j-scheduler-timeline__header-row').length).toBe(
      2,
    );
    expect(fixture.nativeElement.querySelector('[data-header-unit="year"]')?.textContent).toContain(
      '26',
    );
    expect(fixture.nativeElement.querySelector('[data-header-unit="week"]')?.textContent).toContain(
      'Week',
    );
  });

  it('uses one roving timeline-cell tab stop and follows logical arrow keys', async () => {
    await TestBed.configureTestingModule({
      imports: [JSchedulerTimelineRendererComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(JSchedulerTimelineRendererComponent);
    fixture.componentRef.setInput('view', 'timelineDay');
    fixture.componentRef.setInput('range', {
      start: new Date(2026, 7, 5),
      end: new Date(2026, 7, 6),
    });
    fixture.detectChanges();
    const first = fixture.nativeElement.querySelector(
      '.j-scheduler-timeline__cell[tabindex="0"]',
    ) as HTMLButtonElement;
    expect(first).toBeTruthy();
    expect(
      fixture.nativeElement.querySelectorAll('.j-scheduler-timeline__cell[tabindex="0"]'),
    ).toHaveLength(1);
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect((document.activeElement as HTMLElement).dataset['focusKey']).toBe('__schedule|1');
  });
});
