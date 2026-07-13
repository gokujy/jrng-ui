import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JComboboxComponent } from './combobox.component';

const OPTIONS = [
  { label: 'Apple', value: 'a' },
  { label: 'Banana', value: 'b' },
];

describe('JComboboxComponent', () => {
  let component: JComboboxComponent;
  let fixture: ComponentFixture<JComboboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JComboboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JComboboxComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
  });

  it('resets value and emits null on close with an unmatched query when forceSelection is set', () => {
    fixture.componentRef.setInput('forceSelection', true);
    fixture.detectChanges();

    let value: unknown = 'sentinel';
    let selection: unknown = 'sentinel';
    component.valueChange.subscribe((v) => (value = v));
    component.selectionChange.subscribe((s) => (selection = s));

    // Simulate a typed query that matches no option.
    component.query = 'not-a-fruit';
    component.value = 'not-a-fruit';
    component.open = true;

    component.close();

    expect(component.value).toBeNull();
    expect(component.query).toBe('');
    expect(value).toBeNull();
    expect(selection).toBeNull();
    expect(component.open).toBe(false);
  });

  it('keeps a matched query intact on close when forceSelection is set', () => {
    fixture.componentRef.setInput('forceSelection', true);
    fixture.detectChanges();

    const match = component.normalizedOptions[0];
    component.selectOption(match);

    expect(component.value).toBe('a');
    expect(component.query).toBe('Apple');

    component.open = true;
    component.close();

    // A matching query is not reset.
    expect(component.value).toBe('a');
    expect(component.query).toBe('Apple');
  });
});
