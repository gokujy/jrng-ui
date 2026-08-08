import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JSchedulerMonthRendererComponent } from './month-renderer.component';

describe('JSchedulerMonthRendererComponent', () => {
  let fixture: ComponentFixture<JSchedulerMonthRendererComponent>;
  let component: JSchedulerMonthRendererComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [JSchedulerMonthRendererComponent] });
    fixture = TestBed.createComponent(JSchedulerMonthRendererComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('activeDate', new Date(2026, 7, 5));
    fixture.componentRef.setInput('range', {
      start: new Date(2026, 6, 26),
      end: new Date(2026, 8, 6),
    });
  });

  it('calculates the automatic event limit from the available month-row height', () => {
    fixture.componentRef.setInput('maxEventsVisible', 'auto');
    fixture.detectChanges();
    const week = fixture.nativeElement.querySelector('.j-scheduler-month__week') as HTMLElement;
    vi.spyOn(week, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 700, 82));

    component.refreshAutoEventLimit();

    expect(component.effectiveMaxEventsVisible()).toBe(2);
  });

  it('emits an inclusive all-day range from a pointer drag', () => {
    fixture.componentRef.setInput('selectable', true);
    fixture.detectChanges();
    const start = fixture.nativeElement.querySelector(
      '[data-date="2026-08-05"] .j-scheduler-month__date',
    ) as HTMLButtonElement;
    const target = fixture.nativeElement.querySelector('[data-date="2026-08-08"]') as HTMLElement;
    const originalElementFromPoint = Object.getOwnPropertyDescriptor(document, 'elementFromPoint');
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: vi.fn(() => target),
    });
    const selected = vi.fn();
    component.rangeActivate.subscribe(selected);

    start.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 7, clientX: 10 }),
    );
    start.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, pointerId: 7, clientX: 30 }),
    );
    start.dispatchEvent(
      new PointerEvent('pointerup', { bubbles: true, pointerId: 7, clientX: 30 }),
    );

    expect(selected).toHaveBeenCalledWith(
      expect.objectContaining({
        start: new Date(2026, 7, 5),
        end: new Date(2026, 7, 9),
        allDay: true,
      }),
    );
    if (originalElementFromPoint)
      Object.defineProperty(document, 'elementFromPoint', originalElementFromPoint);
    else Reflect.deleteProperty(document, 'elementFromPoint');
  });

  it('treats the selection end as exclusive when highlighting dates', () => {
    fixture.componentRef.setInput('selectedRange', {
      start: new Date(2026, 7, 4),
      end: new Date(2026, 7, 8),
      allDay: true,
      view: 'month',
    });
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('.j-scheduler-month__cell[data-selected="true"]')
        .length,
    ).toBe(4);
  });

  it('uses one roving date tab stop and moves it with arrow keys', async () => {
    fixture.detectChanges();
    const active = fixture.nativeElement.querySelector(
      '.j-scheduler-month__date[tabindex="0"]',
    ) as HTMLButtonElement;
    expect(active).toBeTruthy();
    expect(
      fixture.nativeElement.querySelectorAll('.j-scheduler-month__date[tabindex="0"]'),
    ).toHaveLength(1);
    active.focus();
    active.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect((document.activeElement as HTMLElement).getAttribute('aria-label')).toContain(
      'August 6',
    );
  });
});
