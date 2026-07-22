import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JInputNumberComponent } from './input-number.component';

describe('JInputNumberComponent', () => {
  let component: JInputNumberComponent;
  let fixture: ComponentFixture<JInputNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JInputNumberComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JInputNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function inputEvent(rawValue: string): Event {
    const target = document.createElement('input');
    target.type = 'text';
    target.value = rawValue;
    return { target } as unknown as Event;
  }

  it('does not clamp on input, then clamps to min on blur', () => {
    fixture.componentRef.setInput('min', 5);
    fixture.componentRef.setInput('max', 100);
    fixture.detectChanges();

    // Typing a below-min value leaves it untouched mid-entry.
    component.handleInput(inputEvent('2'));
    expect(component.value).toBe(2);

    // Clamping only happens on blur.
    component.handleBlur();
    expect(component.value).toBe(5);
  });

  it.each([
    ['en-US', '12,345.67'],
    ['en-IN', '12,345.67'],
    ['de-DE', '12.345,67'],
  ])('formats values with the %s locale while keeping a numeric model', (locale, display) => {
    fixture.componentRef.setInput('locale', locale);
    fixture.componentRef.setInput('minFractionDigits', 2);
    fixture.componentRef.setInput('maxFractionDigits', 2);
    component.writeValue(12345.67);
    fixture.detectChanges();

    expect(component.value).toBe(12345.67);
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).value).toBe(display);
  });

  it('parses comma-decimal input without emitting NaN', () => {
    fixture.componentRef.setInput('locale', 'de-DE');
    fixture.detectChanges();
    const changes: (number | null)[] = [];
    component.registerOnChange((value) => changes.push(value));

    component.handleInput(inputEvent('-1.234,5'));
    component.handleInput(inputEvent('-'));

    expect(component.value).toBe(-1234.5);
    expect(changes).toEqual([-1234.5]);
  });

  it('uses Intl currency formatting and gracefully falls back for invalid currency or locale', () => {
    fixture.componentRef.setInput('mode', 'currency');
    fixture.componentRef.setInput('currency', 'USD');
    fixture.componentRef.setInput('locale', 'en-US');
    component.writeValue(42);
    fixture.detectChanges();
    expect(component.displayValue).toContain('$42');

    fixture.componentRef.setInput('currency', 'invalid');
    fixture.componentRef.setInput('locale', 'not_a_locale');
    fixture.detectChanges();
    expect(() => component.displayValue).not.toThrow();
  });

  it('normalizes minFractionDigits above maxFractionDigits', () => {
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.componentRef.setInput('minFractionDigits', 4);
    fixture.componentRef.setInput('maxFractionDigits', 2);
    component.writeValue(1.2);
    fixture.detectChanges();
    expect(component.displayValue).toBe('1.2000');
  });

  it('combines input and forms disabled state independently', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    component.setDisabledState(false);
    expect(component.isDisabled()).toBe(true);
    fixture.componentRef.setInput('disabled', false);
    component.setDisabledState(true);
    fixture.detectChanges();
    expect(component.isDisabled()).toBe(true);
  });

  it('round-trips a plain in-range value through input and blur', () => {
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 100);
    fixture.detectChanges();

    let emitted: number | null = -1;
    component.valueChange.subscribe((value) => (emitted = value));

    component.handleInput(inputEvent('42'));
    expect(component.value).toBe(42);
    expect(emitted).toBe(42);

    component.handleBlur();
    expect(component.value).toBe(42);
  });
});
