import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JRadioComponent } from './radio.component';

describe('JRadioComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JRadioComponent],
    }).compileComponents();
  });

  function create(): JRadioComponent {
    const fixture = TestBed.createComponent(JRadioComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('marks the radio selected when writeValue matches its value', () => {
    const radio = create();
    radio.value = 'apple';

    radio.writeValue('apple');

    expect(radio.selected).toBe(true);
  });

  it('is not selected when the written value differs from its value', () => {
    const radio = create();
    radio.value = 'apple';

    radio.writeValue('banana');

    expect(radio.selected).toBe(false);
  });

  it('selects its own value and emits valueChange on change', () => {
    const radio = create();
    radio.value = 'cherry';

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
    const radio = create();
    radio.value = 'cherry';
    radio.readonly = true;

    let emitted = false;
    radio.valueChange.subscribe(() => (emitted = true));

    radio.handleChange();

    expect(radio.selected).toBe(false);
    expect(emitted).toBe(false);
  });

  it('reflects the disabled state through setDisabledState', () => {
    const radio = create();

    radio.setDisabledState(true);

    expect(radio.isDisabled).toBe(true);
  });
});
