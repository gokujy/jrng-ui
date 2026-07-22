import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JCheckboxComponent } from './checkbox.component';

describe('JCheckboxComponent', () => {
  let component: JCheckboxComponent;
  let fixture: ComponentFixture<JCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JCheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('reflects a boolean value through writeValue', () => {
    component.writeValue(true);
    expect(component.checked).toBe(true);

    component.writeValue(false);
    expect(component.checked).toBe(false);
  });

  it('toggles checked and emits valueChange on change', () => {
    let emitted: boolean | readonly unknown[] | undefined;
    component.valueChange.subscribe((value) => (emitted = value));

    const target = document.createElement('input');
    target.type = 'checkbox';
    target.checked = true;

    component.handleChange({ target } as unknown as Event);

    expect(component.checked).toBe(true);
    expect(emitted).toBe(true);
  });

  it('reflects membership when bound to an array value', () => {
    fixture.componentRef.setInput('value', 'blue');
    component.writeValue(['red', 'blue']);
    expect(component.checked).toBe(true);

    component.writeValue(['red', 'green']);
    expect(component.checked).toBe(false);
  });

  it('adds and removes its value from the array on change', () => {
    fixture.componentRef.setInput('value', 'blue');
    component.writeValue(['red']);

    let emitted: boolean | readonly unknown[] | undefined;
    component.valueChange.subscribe((value) => (emitted = value));

    const target = document.createElement('input');
    target.type = 'checkbox';
    target.checked = true;

    component.handleChange({ target } as unknown as Event);

    expect(emitted).toEqual(['red', 'blue']);
  });

  it('ignores changes and restores the input when readonly', () => {
    fixture.componentRef.setInput('readonly', true);
    component.checked = false;

    const target = document.createElement('input');
    target.type = 'checkbox';
    target.checked = true;

    component.handleChange({ target } as unknown as Event);

    expect(component.checked).toBe(false);
    expect(target.checked).toBe(false);
  });

  it('clears indeterminate once a change occurs', () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();
    expect(component.isIndeterminate()).toBe(true);

    const target = document.createElement('input');
    target.type = 'checkbox';
    target.checked = true;

    component.handleChange({ target } as unknown as Event);

    expect(component.isIndeterminate()).toBe(false);
  });
});
