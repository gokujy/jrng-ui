import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { JRecurrenceEditorComponent } from './recurrence-editor.component';

describe('JRecurrenceEditorComponent', () => {
  it('parses, validates and serializes controlled recurrence values', async () => {
    await TestBed.configureTestingModule({
      imports: [JRecurrenceEditorComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(JRecurrenceEditorComponent);
    expect(fixture.componentInstance.parse('FREQ=WEEKLY;BYDAY=MO,WE;COUNT=4')).toBe(true);
    fixture.detectChanges();
    expect(fixture.componentInstance.valid()).toBe(true);
    expect(fixture.componentInstance.toRRule()).toBe('FREQ=WEEKLY;BYDAY=MO,WE;COUNT=4');
    expect(fixture.nativeElement.textContent).toContain('Every week');
  });
});
