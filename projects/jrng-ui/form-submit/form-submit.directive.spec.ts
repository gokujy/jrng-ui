import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JFormSubmitDirective, jClearServerErrors } from './form-submit.directive';

@Component({
  imports: [ReactiveFormsModule, JFormSubmitDirective],
  template: `<form jFormSubmit [formGroup]="form">
    <input id="name" formControlName="name" />
    <div formArrayName="items"><input formControlName="0" /></div>
    <button type="submit">Save</button>
  </form>`,
})
class Host {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    items: new FormArray([new FormControl('', Validators.required)]),
  });
}

describe('JFormSubmitDirective', () => {
  let fixture: ComponentFixture<Host>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });
  it('marks nested groups and arrays touched and focuses the first invalid control', () => {
    const input = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
    vi.spyOn(input, 'focus');
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.form.controls.name.touched).toBe(true);
    expect(fixture.componentInstance.form.controls.items.at(0).touched).toBe(true);
    expect(input.focus).toHaveBeenCalled();
  });
  it('removes only server errors recursively', () => {
    fixture.componentInstance.form.controls.items
      .at(0)
      .setErrors({ server: 'Failed', required: true });
    jClearServerErrors(fixture.componentInstance.form);
    expect(fixture.componentInstance.form.controls.items.at(0).errors).toEqual({ required: true });
  });
});
