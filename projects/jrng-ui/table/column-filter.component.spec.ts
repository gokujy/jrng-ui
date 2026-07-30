import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JColumnFilterChange, JColumnFilterComponent } from './column-filter.component';

@Component({
  imports: [JColumnFilterComponent],
  template: `<j-column-filter
    field="amount"
    label="Amount"
    type="number"
    operator="between"
    [value]="value"
    (filterChange)="changed = $event"
  />`,
})
class ColumnFilterHostComponent {
  value: readonly number[] = [];
  changed?: JColumnFilterChange;
}

describe('JColumnFilterComponent', () => {
  let fixture: ComponentFixture<ColumnFilterHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnFilterHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ColumnFilterHostComponent);
    fixture.detectChanges();
  });

  it('renders accessible range controls and emits a typed model', () => {
    const inputs = fixture.debugElement.queryAll(By.css('input'));
    expect(inputs.length).toBe(2);
    expect(inputs[0]?.attributes['aria-label']).toContain('from');
    const element = inputs[0]?.nativeElement as HTMLInputElement;
    element.value = '10';
    element.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.changed).toEqual({
      field: 'amount',
      operator: 'between',
      value: [10, ''],
    });
  });

  it('preserves object values selected from configured options', () => {
    const selectFixture = TestBed.createComponent(JColumnFilterComponent);
    const account = { id: 7, label: 'Enterprise' };
    selectFixture.componentRef.setInput('field', 'account');
    selectFixture.componentRef.setInput('type', 'select');
    selectFixture.componentRef.setInput('options', [{ label: 'Enterprise', value: account }]);
    selectFixture.detectChanges();
    const filter = selectFixture.componentInstance;
    const changes: JColumnFilterChange[] = [];
    filter.filterChange.subscribe((change) => changes.push(change));

    filter.handleSelect({ target: { value: '0' } } as unknown as Event);

    expect(changes.at(-1)?.value).toBe(account);
  });
});
