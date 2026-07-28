import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JAutocompleteComponent } from 'jrng-ui/autocomplete';
import { JCheckboxComponent } from 'jrng-ui/checkbox';
import { JChipsComponent } from 'jrng-ui/chips';
import { JColorPickerComponent } from 'jrng-ui/color-picker';
import { JDatePickerComponent } from 'jrng-ui/date-picker';
import { JInputComponent } from 'jrng-ui/input';
import { JInputMaskComponent } from 'jrng-ui/input-mask';
import { JKnobComponent } from 'jrng-ui/knob';
import { JListboxComponent } from 'jrng-ui/listbox';
import { JMultiselectComponent } from 'jrng-ui/multiselect';
import { JPasswordComponent } from 'jrng-ui/password';
import { JRadioComponent } from 'jrng-ui/radio';
import { JRadioGroupComponent } from 'jrng-ui/radio-group';
import { JRatingComponent } from 'jrng-ui/rating';
import { JSelectComponent } from 'jrng-ui/select';
import { JSelectButtonComponent } from 'jrng-ui/select-button';
import { JSliderComponent } from 'jrng-ui/slider';
import { JSwitchComponent } from 'jrng-ui/switch';
import { JTextareaComponent } from 'jrng-ui/textarea';
import { JToggleButtonComponent } from 'jrng-ui/toggle-button';

interface DisabledControl {
  setDisabledState(disabled: boolean): void;
}

type DisabledCase = readonly [
  name: string,
  component: Type<DisabledControl>,
  readDisabled: (instance: DisabledControl) => boolean,
];

const signalState = (instance: DisabledControl): boolean =>
  (
    instance as DisabledControl & {
      readonly isDisabled: () => boolean;
    }
  ).isDisabled();

const disabledCases: readonly DisabledCase[] = [
  ['Autocomplete', JAutocompleteComponent, signalState],
  ['Checkbox', JCheckboxComponent, signalState],
  ['Chips', JChipsComponent, (instance) => (instance as JChipsComponent).isDisabled],
  [
    'Color Picker',
    JColorPickerComponent,
    (instance) =>
      (
        instance as DisabledControl & {
          readonly disabledState: () => boolean;
        }
      ).disabledState(),
  ],
  ['Date Picker', JDatePickerComponent, signalState],
  ['Input', JInputComponent, signalState],
  ['Input Mask', JInputMaskComponent, signalState],
  ['Knob', JKnobComponent, signalState],
  ['Listbox', JListboxComponent, signalState],
  ['Multiselect', JMultiselectComponent, signalState],
  ['Password', JPasswordComponent, signalState],
  ['Radio', JRadioComponent, signalState],
  ['Radio Group', JRadioGroupComponent, signalState],
  ['Rating', JRatingComponent, signalState],
  ['Select', JSelectComponent, signalState],
  ['Select Button', JSelectButtonComponent, signalState],
  ['Slider', JSliderComponent, signalState],
  ['Switch', JSwitchComponent, signalState],
  ['Textarea', JTextareaComponent, signalState],
  ['Toggle Button', JToggleButtonComponent, signalState],
];

describe.each(disabledCases)('%s disabled-state composition', (_name, component, readDisabled) => {
  it('keeps either the input or Angular forms source authoritative', () => {
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();

    fixture.componentInstance.setDisabledState(true);
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    expect(readDisabled(fixture.componentInstance)).toBe(true);

    fixture.componentInstance.setDisabledState(false);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(readDisabled(fixture.componentInstance)).toBe(true);

    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    expect(readDisabled(fixture.componentInstance)).toBe(false);
  });
});
