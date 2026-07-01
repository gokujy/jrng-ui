import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { JrInputComponent } from './input.component';

@Component({
  imports: [JrInputComponent, ReactiveFormsModule],
  template: `
    <jr-input
      label="Email"
      placeholder="name@company.com"
      [formControl]="control"
      [error]="error"
      [success]="success"
      [multiline]="multiline"
    />
  `,
})
class InputHostComponent {
  control = new FormControl<string>('initial', { nonNullable: true });
  error = '';
  success = '';
  multiline = false;
}

describe('JrInputComponent', () => {
  let fixture: ComponentFixture<InputHostComponent>;
  let host: InputHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function field(): HTMLInputElement | HTMLTextAreaElement {
    return fixture.debugElement.query(By.css('input, textarea')).nativeElement as
      HTMLInputElement | HTMLTextAreaElement;
  }

  function detectHostChanges(): void {
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  }

  it('writes the form control value to the input', () => {
    expect(field().value).toBe('initial');

    host.control.setValue('updated');
    detectHostChanges();

    expect(field().value).toBe('updated');
  });

  it('updates the form control from user input', () => {
    field().value = 'ops@jr.test';
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.control.value).toBe('ops@jr.test');
  });

  it('reflects disabled state from forms and input binding', () => {
    host.control.disable();
    detectHostChanges();

    expect(field().disabled).toBe(true);

    host.control.enable();
    detectHostChanges();

    expect(field().disabled).toBe(false);
  });

  it('renders error state before success state', () => {
    host.success = 'Looks good';
    host.error = 'Required';
    detectHostChanges();

    const control = fixture.debugElement.query(By.css('.jr-input__control'))
      .nativeElement as HTMLElement;
    const message = fixture.debugElement.query(By.css('.jr-input__message'))
      .nativeElement as HTMLElement;

    expect(control.classList).toContain('jr-input__control--error');
    expect(message.textContent).toContain('Required');
  });

  it('supports textarea mode', () => {
    host.multiline = true;
    detectHostChanges();

    expect(fixture.debugElement.query(By.css('textarea'))).toBeTruthy();
  });
});
