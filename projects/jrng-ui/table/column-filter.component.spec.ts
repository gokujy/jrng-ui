import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JColumnFilterComponent, JColumnFilterModelChange } from './column-filter.component';

@Component({
  imports: [JColumnFilterComponent],
  template: `<j-column-filter
    field="amount"
    label="Amount"
    type="number"
    operator="between"
    [value]="value"
    (filterModelChange)="changed = $event"
  />`,
})
class ColumnFilterHostComponent {
  value: readonly number[] = [];
  changed?: JColumnFilterModelChange;
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
});
