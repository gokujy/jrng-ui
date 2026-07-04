import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { JrInputComponent } from './input.component';

@Component({
  imports: [JrInputComponent, ReactiveFormsModule],
  template: `
    <j-input
      label="Email"
      placeholder="user@example.com"
      [formControl]="control"
      [error]="error"
      [clearable]="clearable"
    />
  `,
})
class InputHostComponent {
  control = new FormControl<string>('initial', { nonNullable: true });
  error = '';
  clearable = false;
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
    return fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
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
    field().value = 'user@example.test';
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.control.value).toBe('user@example.test');
  });

  it('associates errors through aria-describedby', () => {
    host.error = 'Required';
    detectHostChanges();

    const input = field();
    const describedBy = input.getAttribute('aria-describedby');

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy || '')?.textContent).toContain('Required');
  });

  it('reflects disabled state from forms and input binding', () => {
    host.control.disable();
    detectHostChanges();

    expect(field().disabled).toBe(true);

    host.control.enable();
    detectHostChanges();

    expect(field().disabled).toBe(false);
  });

  it('renders error state', () => {
    host.error = 'Required';
    detectHostChanges();

    const control = fixture.debugElement.query(By.css('.j-input')).nativeElement as HTMLElement;
    const message = fixture.debugElement.query(By.css('.j-input__message')).nativeElement as HTMLElement;

    expect(control.classList).toContain('is-invalid');
    expect(message.textContent).toContain('Required');
  });

  it('clears the value when clearable', () => {
    host.clearable = true;
    detectHostChanges();

    fixture.debugElement.query(By.css('.j-input__clear')).nativeElement.click();
    fixture.detectChanges();

    expect(host.control.value).toBe('');
  });
});
