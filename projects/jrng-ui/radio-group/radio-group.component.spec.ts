import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JRadioGroupComponent, JRadioGroupOption } from './radio-group.component';

const OPTIONS: readonly JRadioGroupOption[] = [
  { label: 'A', value: 'a' },
  { label: 'B', value: 'b', disabled: true },
  { label: 'C', value: 'c' },
];

describe('JRadioGroupComponent', () => {
  let component: JRadioGroupComponent;
  let fixture: ComponentFixture<JRadioGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JRadioGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JRadioGroupComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
  });

  it('selects an option, setting value and emitting change events', () => {
    let value: unknown;
    let selection: unknown;
    component.valueChange.subscribe((v) => (value = v));
    component.selectionChange.subscribe((s) => (selection = s));

    const first = component.normalizedOptions()[0];
    component.selectOption(first, 0);

    expect(component.value).toBe('a');
    expect(value).toBe('a');
    expect(selection).toEqual(first);
  });

  it('advances selection to the next enabled option on arrow key, skipping disabled', () => {
    let value: unknown;
    component.valueChange.subscribe((v) => (value = v));

    // Start on index 0 ('a'); ArrowDown should skip disabled index 1 ('b')
    // and land on index 2 ('c').
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    component.handleKeydown(event, 0);

    expect(component.value).toBe('c');
    expect(value).toBe('c');
    expect(component.activeIndex).toBe(2);
  });
});
