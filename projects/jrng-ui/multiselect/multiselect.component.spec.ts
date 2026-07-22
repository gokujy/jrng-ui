import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JMultiselectComponent } from './multiselect.component';

describe('JMultiselectComponent', () => {
  let component: JMultiselectComponent;
  let fixture: ComponentFixture<JMultiselectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(JMultiselectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', [
      { label: 'Alpha', value: 'a' },
      { label: 'Beta', value: 'b' },
      { label: 'Gamma', value: 'c' },
    ]);
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
    fixture.componentRef.setInput('virtualScroll', true);
    expect(component.useVirtual).toBe(true);
    fixture.componentRef.setInput('loading', true);
    expect(component.useVirtual).toBe(false);
  });

  it('renders severity-aware removable JRNG chips with overflow', () => {
    fixture.componentRef.setInput('options', [
      { label: 'Stable', value: 'stable', severity: 'success', icon: 'check' },
      { label: 'At risk', value: 'risk', severity: 'warning' },
      { label: 'Blocked', value: 'blocked', severity: 'danger' },
    ]);
    fixture.componentRef.setInput('displayMode', 'chips');
    fixture.componentRef.setInput('maxSelectedLabels', 2);
    component.writeValue(['stable', 'risk', 'blocked']);
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelectorAll('j-chip');
    expect(chips).toHaveLength(3);
    expect(chips[0].querySelector('.j-chip')?.getAttribute('data-j-severity')).toBe('success');
    expect(chips[1].querySelector('.j-chip')?.getAttribute('data-j-severity')).toBe('warning');
    expect(chips[2].textContent).toContain('+1');
  });

  it('supports resolver severity and keyboard chip removal', () => {
    fixture.componentRef.setInput('options', [
      { label: 'First', value: 1 },
      { label: 'Second', value: 2 },
    ]);
    fixture.componentRef.setInput('displayMode', 'chips');
    fixture.componentRef.setInput('chipSeverityResolver', () => 'info');
    component.writeValue([1, 2]);
    fixture.detectChanges();

    expect(component.resolveChipSeverity(component.selectedOptions[0])).toBe('info');
    component.handleKeydown(new KeyboardEvent('keydown', { key: 'Backspace' }));
    expect(component.value).toEqual([1]);
  });
});
