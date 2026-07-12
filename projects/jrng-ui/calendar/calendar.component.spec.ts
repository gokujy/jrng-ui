import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JCalendarComponent } from './calendar.component';

describe('JCalendarComponent', () => {
  let fixture: ComponentFixture<JCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [JCalendarComponent] }).compileComponents();
    fixture = TestBed.createComponent(JCalendarComponent);
  });

  it('renders a complete month and exposes the selected date', () => {
    fixture.componentRef.setInput('value', new Date(2026, 6, 12));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('July 2026');
    expect(fixture.debugElement.queryAll(By.css('.j-calendar__cell'))).toHaveLength(42);
    const selected = fixture.debugElement.query(By.css('.j-calendar__cell.is-selected'));
    expect(selected.nativeElement.textContent.trim()).toBe('12');
    expect(selected.attributes['aria-selected']).toBe('true');
  });
});
