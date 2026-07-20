import { Component, reflectComponentType, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { JFormFieldComponent } from './form-field.component';

describe('JFormFieldComponent public contract', () => {
  const metadata = reflectComponentType(JFormFieldComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-form-field');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});

@Component({
  imports: [ReactiveFormsModule, JFormFieldComponent],
  template: `<j-form-field
    label="Email"
    hint="Work address"
    error="Invalid email"
    required
    [invalid]="invalid()"
    [control]="control"
    [showCharacterCount]="true"
    [maxLength]="80"
    ><input [formControl]="control"
  /></j-form-field>`,
})
class FormFieldHost {
  readonly control = new FormControl('', Validators.email);
  readonly invalid = signal(false);
}

describe('JFormFieldComponent accessibility', () => {
  let fixture: ComponentFixture<FormFieldHost>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormFieldHost] }).compileComponents();
    fixture = TestBed.createComponent(FormFieldHost);
    fixture.detectChanges();
  });
  it('connects projected control, label, hint, and count IDs', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    expect(input.id).toBeTruthy();
    expect(label.htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-labelledby')).toContain(label.id);
    expect(input.getAttribute('aria-describedby')).toContain(
      fixture.nativeElement.querySelector('.j-form-field__message').id,
    );
    expect(input.getAttribute('aria-required')).toBe('true');
  });
  it('associates errors and marks the control invalid', () => {
    fixture.componentInstance.invalid.set(true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain(
      fixture.nativeElement.querySelector('[role="alert"]').id,
    );
    const errorId = fixture.nativeElement.querySelector('[role="alert"]').id;
    fixture.componentInstance.invalid.set(false);
    fixture.detectChanges();
    expect(input.getAttribute('aria-describedby')).not.toContain(errorId);
    expect(input.getAttribute('aria-describedby')).toContain(
      fixture.nativeElement.querySelector('.j-form-field__message').id,
    );
  });
});
