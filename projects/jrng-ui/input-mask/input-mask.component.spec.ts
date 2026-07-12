import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { JInputMaskComponent } from './input-mask.component';

describe('JInputMaskComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [JInputMaskComponent] }).compileComponents();
  });

  it('formats typed and programmatic values with digit and letter tokens', () => {
    const fixture = TestBed.createComponent(JInputMaskComponent);
    const component = fixture.componentInstance;
    component.mask = '(999) 999-9999';
    component.writeValue('5551234567');
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.value).toBe('(555) 123-4567');

    component.mask = 'aa-9999';
    input.value = 'jr2048';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(input.value).toBe('jr-2048');
  });

  it('can emit the unmasked value', () => {
    const fixture = TestBed.createComponent(JInputMaskComponent);
    const component = fixture.componentInstance;
    const onChange = vi.fn();
    component.mask = '(999) 999-9999';
    component.unmask = true;
    component.registerOnChange(onChange);
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = '5551234567';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(onChange).toHaveBeenCalledWith('5551234567');
  });
});
