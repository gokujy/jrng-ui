import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JSwitchComponent } from './switch.component';

describe('JSwitchComponent', () => {
  let component: JSwitchComponent;

  function toggle(checked: boolean): void {
    const target = { checked } as HTMLInputElement;
    component.handleChange({ target } as unknown as Event);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [JSwitchComponent] });
    component = TestBed.createComponent(JSwitchComponent).componentInstance;
  });

  it('reflects the on state when writeValue matches trueValue', () => {
    component.writeValue(true);
    expect(component.checked).toBe(true);
    expect(component.value).toBe(true);
    expect(component.rootClasses).toContain('is-checked');
  });

  it('reflects the off state when writeValue is null or falseValue', () => {
    component.writeValue(null);
    expect(component.checked).toBe(false);
    expect(component.value).toBe(false);
    expect(component.rootClasses).not.toContain('is-checked');
  });

  it('honors custom trueValue/falseValue in writeValue', () => {
    component.trueValue = 'yes';
    component.falseValue = 'no';
    component.writeValue('yes');
    expect(component.checked).toBe(true);
  });

  it('emits valueChange with trueValue/falseValue when toggled', () => {
    component.trueValue = 'on';
    component.falseValue = 'off';
    const emitted: unknown[] = [];
    component.valueChange.subscribe((value) => emitted.push(value));

    toggle(true);
    expect(component.checked).toBe(true);
    expect(component.value).toBe('on');

    toggle(false);
    expect(component.checked).toBe(false);
    expect(component.value).toBe('off');

    expect(emitted).toEqual(['on', 'off']);
  });

  it('ignores changes while readonly', () => {
    component.readonly = true;
    const emitted: unknown[] = [];
    component.valueChange.subscribe((value) => emitted.push(value));

    toggle(true);

    expect(component.checked).toBe(false);
    expect(emitted).toEqual([]);
  });
});
