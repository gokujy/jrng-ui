import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { JRadioComponent } from './radio.component';

@Component({
  imports: [FormsModule, JRadioComponent],
  template: `
    <j-radio name="plan" label="Starter" value="starter" [(ngModel)]="plan" />
    <j-radio name="plan" label="Pro" value="pro" [(ngModel)]="plan" />
  `,
})
class RadioGroupHost {
  plan = 'pro';
}

describe('JRadioComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JRadioComponent],
    }).compileComponents();
  });

  function create(): ComponentFixture<JRadioComponent> {
    const fixture = TestBed.createComponent(JRadioComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('marks the radio selected when writeValue matches its value', () => {
    const fixture = create();
    const radio = fixture.componentInstance;
    fixture.componentRef.setInput('value', 'apple');

    radio.writeValue('apple');

    expect(radio.selected).toBe(true);
  });

  it('is not selected when the written value differs from its value', () => {
    const fixture = create();
    const radio = fixture.componentInstance;
    fixture.componentRef.setInput('value', 'apple');

    radio.writeValue('banana');

    expect(radio.selected).toBe(false);
  });

  it('selects its own value and emits valueChange on change', () => {
    const fixture = create();
    const radio = fixture.componentInstance;
    fixture.componentRef.setInput('value', 'cherry');

    let onChangeValue: unknown;
    let emitted: unknown;
    radio.registerOnChange((value) => (onChangeValue = value));
    radio.valueChange.subscribe((value) => (emitted = value));

    radio.handleChange();

    expect(radio.selected).toBe(true);
    expect(onChangeValue).toBe('cherry');
    expect(emitted).toBe('cherry');
  });

  it('ignores change events while readonly', () => {
    const fixture = create();
    const radio = fixture.componentInstance;
    fixture.componentRef.setInput('value', 'cherry');
    fixture.componentRef.setInput('readonly', true);

    let emitted = false;
    radio.valueChange.subscribe(() => (emitted = true));

    radio.handleChange();

    expect(radio.selected).toBe(false);
    expect(emitted).toBe(false);
  });

  it('reflects the disabled state through setDisabledState', () => {
    const fixture = create();
    const radio = fixture.componentInstance;

    radio.setDisabledState(true);

    expect(radio.isDisabled()).toBe(true);
  });

  it('updates a shared model and visual selection when clicked', async () => {
    const fixture = TestBed.createComponent(RadioGroupHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll(
      'input[type="radio"]',
    ) as NodeListOf<HTMLInputElement>;
    expect(inputs[1].checked).toBe(true);

    inputs[0].click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.plan).toBe('starter');
    expect(inputs[0].checked).toBe(true);
    expect(inputs[1].checked).toBe(false);
  });
});
