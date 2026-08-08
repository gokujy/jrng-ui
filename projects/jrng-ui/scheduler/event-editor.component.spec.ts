import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { JSchedulerEventEditorComponent } from './event-editor.component';

describe('JSchedulerEventEditorComponent', () => {
  it('emits an immutable validated event from reactive form state', async () => {
    await TestBed.configureTestingModule({
      imports: [JSchedulerEventEditorComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(JSchedulerEventEditorComponent);
    const source = {
      id: 'edit',
      title: 'Original',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
    };
    fixture.componentRef.setInput('event', source);
    fixture.detectChanges();
    const save = vi.fn();
    fixture.componentInstance.saveRequest.subscribe(save);
    fixture.componentInstance.form.patchValue({ title: 'Updated', location: 'Room A' });
    fixture.componentInstance.save();

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        previousEvent: source,
        event: expect.objectContaining({ title: 'Updated', location: 'Room A' }),
      }),
    );
    expect(source.title).toBe('Original');
  });

  it('rejects invalid end times', async () => {
    await TestBed.configureTestingModule({
      imports: [JSchedulerEventEditorComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(JSchedulerEventEditorComponent);
    fixture.detectChanges();
    fixture.componentInstance.form.patchValue({
      title: 'Invalid',
      startDate: new Date(2026, 7, 5),
      startTime: '11:00',
      endDate: new Date(2026, 7, 5),
      endTime: '10:00',
    });
    fixture.componentInstance.save();
    expect(fixture.componentInstance.formError()).toBe('End must be after start.');
  });
});
