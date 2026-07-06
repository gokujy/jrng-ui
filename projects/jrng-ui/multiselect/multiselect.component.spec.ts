import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JMultiselectComponent } from './multiselect.component';

describe('JMultiselectComponent', () => {
  let component: JMultiselectComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(JMultiselectComponent);
    component = fixture.componentInstance;
    component.options = [
      { label: 'Alpha', value: 'a' },
      { label: 'Beta', value: 'b' },
      { label: 'Gamma', value: 'c' },
    ];
    fixture.detectChanges();
  });

  it('writeValue reflects the selected options', () => {
    component.writeValue(['a', 'c']);
    const [alpha, beta, gamma] = component.visibleOptions;
    expect(component.isSelected(alpha)).toBe(true);
    expect(component.isSelected(beta)).toBe(false);
    expect(component.isSelected(gamma)).toBe(true);
  });

  it('toggleOption adds then removes a value and emits an array', () => {
    let emitted: readonly unknown[] = [];
    component.valueChange.subscribe((value) => (emitted = value));

    component.toggleOption(component.visibleOptions[0]);
    expect(emitted).toEqual(['a']);

    component.toggleOption(component.visibleOptions[0]);
    expect(emitted).toEqual([]);
  });

  it('filters options by the current filter text', () => {
    component.filterText = 'bet';
    expect(component.visibleOptions.map((option) => option.value)).toEqual(['b']);
  });

  it('enables virtual scrolling only when virtualScroll is set and not loading', () => {
    expect(component.useVirtual).toBe(false);
    component.virtualScroll = true;
    expect(component.useVirtual).toBe(true);
    component.loading = true;
    expect(component.useVirtual).toBe(false);
  });
});
