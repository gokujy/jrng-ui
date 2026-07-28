import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JAutocompleteComponent } from './autocomplete.component';

describe('JAutocompleteComponent public contract', () => {
  const metadata = reflectComponentType(JAutocompleteComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-autocomplete');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});

describe('JAutocompleteComponent disabled-state composition', () => {
  it('does not let input and form state re-enable one another', () => {
    const fixture = TestBed.createComponent(JAutocompleteComponent);
    fixture.detectChanges();
    fixture.componentInstance.setDisabledState(true);
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    expect(fixture.componentInstance.isDisabled()).toBe(true);

    fixture.componentInstance.setDisabledState(false);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.componentInstance.isDisabled()).toBe(true);
  });
});
