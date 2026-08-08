import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { JSchedulerAgendaRendererComponent } from './agenda-renderer.component';

describe('JSchedulerAgendaRendererComponent', () => {
  it('renders a bounded agenda window for long logical ranges', async () => {
    await TestBed.configureTestingModule({
      imports: [JSchedulerAgendaRendererComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(JSchedulerAgendaRendererComponent);
    fixture.componentRef.setInput('range', {
      start: new Date(2026, 0, 1),
      end: new Date(2027, 0, 1),
    });
    fixture.componentRef.setInput('showEmptyDays', true);
    fixture.componentRef.setInput('virtual', true);
    fixture.componentRef.setInput('virtualThreshold', 20);
    fixture.componentRef.setInput('scrollOffset', 11_200);
    fixture.componentRef.setInput('viewportHeight', 560);
    fixture.detectChanges();

    expect(fixture.componentInstance.groups()).toHaveLength(365);
    expect(fixture.componentInstance.window().items.length).toBeLessThan(20);
    expect(fixture.componentInstance.window().startIndex).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelectorAll('.j-scheduler-agenda__day').length).toBeLessThan(
      20,
    );
  });
});
