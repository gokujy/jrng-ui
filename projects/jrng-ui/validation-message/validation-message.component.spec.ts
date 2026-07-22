import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { JValidationMessageComponent } from './validation-message.component';

@Component({
  imports: [JValidationMessageComponent],
  template: `<j-validation-message
    [control]="control"
    [submitted]="submitted()"
    [displayMode]="mode()"
  />`,
})
class Host {
  control = new FormControl('', Validators.required);
  submitted = signal(false);
  mode = signal<'touched' | 'dirty' | 'submit' | 'always'>('touched');
}

describe('JValidationMessageComponent', () => {
  let fixture: ComponentFixture<Host>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });
  it('supports touched, dirty, submit, and always display modes', () => {
    expect(fixture.nativeElement.textContent).not.toContain('required');
    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('This field is required.');
    fixture.componentInstance.control.markAsUntouched();
    fixture.componentInstance.mode.set('submit');
    fixture.componentInstance.submitted.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });
  it('supports server and multiple errors', () => {
    fixture.componentInstance.mode.set('always');
    fixture.componentInstance.control.setErrors({ server: 'Already used.', email: true });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Already used.');
    expect(fixture.nativeElement.textContent).toContain('valid email');
  });
});
