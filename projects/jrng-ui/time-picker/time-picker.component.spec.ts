import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach } from 'vitest';
import { JTimePickerComponent } from './time-picker.component';

describe('JTimePickerComponent', () => {
  let fixture: ComponentFixture<JTimePickerComponent>;
  let component: JTimePickerComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(JTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the JRNG clock icon in its trigger', () => {
    expect(fixture.nativeElement.querySelector('.j-time-picker__icon svg path')).toBeTruthy();
  });

  it('does not open or emit changes while disabled', () => {
    const values: (string | null)[] = [];
    component.valueChange.subscribe((value) => values.push(value));
    component.writeValue('10:15');
    component.setDisabledState(true);
    fixture.detectChanges();

    component.open();
    component.selectNow();
    component.handleMinuteChange(selectChange('30'));
    component.clearValue();

    expect(component.isOpen).toBe(false);
    expect(component.value).toBe('10:15');
    expect(values).toEqual([]);
    expect(fixture.nativeElement.querySelector('.j-time-picker__control').disabled).toBe(true);
  });

  it('closes an open panel when disabled changes at runtime', () => {
    component.open();
    expect(component.isOpen).toBe(true);

    component.setDisabledState(true);

    expect(component.isOpen).toBe(false);
  });

  it('constrains the option panel to the viewport', () => {
    component.open();
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('.j-time-picker__panel') as HTMLElement;
    expect(panel).toBeTruthy();
    expect(getComputedStyle(panel).overflow).toBe('auto');
  });
});

function selectChange(value: string): Event {
  const select = document.createElement('select');
  const option = document.createElement('option');
  option.value = value;
  select.append(option);
  select.value = value;
  return { target: select } as unknown as Event;
}
