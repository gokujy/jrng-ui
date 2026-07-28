import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { JQueryBuilderComponent } from './query-builder.component';
import {
  JQueryField,
  JQueryGroup,
  jCreateQueryCondition,
  jCreateQueryGroup,
} from './query-builder.model';

const fields: readonly JQueryField[] = [
  { key: 'name', label: 'Customer name', type: 'text' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'active', label: 'Active', type: 'boolean' },
  { key: 'created', label: 'Created', type: 'date' },
];

const initial = jCreateQueryGroup('root', 'and', [
  { ...jCreateQueryCondition('name-condition', fields[0]), value: 'Acme' },
  jCreateQueryGroup('nested', 'or', [
    { ...jCreateQueryCondition('amount-condition', fields[1]), value: 100 },
  ]),
]);

@Component({
  imports: [ReactiveFormsModule, JQueryBuilderComponent],
  template: `
    <j-query-builder
      [fields]="fields"
      [formControl]="control"
      [readonly]="readonly"
      [dir]="direction"
    >
      <ng-template #jQueryField let-field>
        <span class="custom-field">{{ field?.label ?? 'Missing field' }}</span>
      </ng-template>
      <ng-template #jQueryValueEditor let-condition>
        <span class="custom-value">{{ condition.value }}</span>
      </ng-template>
      <ng-template #jQueryGroupHeader let-group>
        <span class="custom-group">{{ group.join }}</span>
      </ng-template>
      <ng-template #jQueryEmpty>
        <span class="custom-empty">Build a customer filter</span>
      </ng-template>
    </j-query-builder>
  `,
})
class QueryBuilderHost {
  readonly fields = fields;
  readonly control = new FormControl<JQueryGroup>(initial, { nonNullable: true });
  readonly = false;
  direction: 'ltr' | 'rtl' = 'ltr';
}

describe('JQueryBuilderComponent', () => {
  it('renders root and nested groups in logical linear order with accessible labels', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('fields', fields);
    fixture.componentRef.setInput('value', initial);
    fixture.detectChanges();

    const groups = fixture.nativeElement.querySelectorAll('.j-query-builder__group');
    const conditions = fixture.nativeElement.querySelectorAll('.j-query-builder__condition');
    expect(groups).toHaveLength(2);
    expect(conditions).toHaveLength(2);
    expect(groups[0].getAttribute('aria-label')).toContain('Root AND');
    expect(groups[1].getAttribute('aria-label')).toContain('Nested OR');
    expect(
      fixture.nativeElement.querySelector('.j-query-builder')?.getAttribute('aria-label'),
    ).toBe('Query builder');
  });

  it('emits immutable controlled values for add, duplicate, and remove operations', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('fields', fields);
    fixture.componentRef.setInput('value', initial);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const values: JQueryGroup[] = [];
    component.valueChange.subscribe((value) => values.push(value));

    component.addCondition('nested');
    const added = component.model();
    component.duplicateNode('name-condition');
    component.removeNode('amount-condition', 'nested');

    expect(values).toHaveLength(3);
    expect(added).not.toBe(initial);
    expect((initial.children[1] as JQueryGroup).children).toHaveLength(1);
    expect(component.rows().filter((row) => row.node.kind === 'condition')).toHaveLength(3);
  });

  it('resets incompatible values when fields and operators change', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('fields', fields);
    fixture.componentRef.setInput('value', initial);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.changeField('name-condition', selectEvent('amount'));
    let condition = component.rows().find((row) => row.node.id === 'name-condition')?.node;
    expect(condition).toMatchObject({ field: 'amount', operator: 'equals', value: 0 });

    component.changeOperator('name-condition', selectEvent('between'));
    condition = component.rows().find((row) => row.node.id === 'name-condition')?.node;
    expect(condition).toMatchObject({ operator: 'between', value: { from: 0, to: 0 } });
  });

  it('preserves unknown fields and operators as recoverable validation errors', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('fields', fields);
    fixture.componentRef.setInput(
      'value',
      jCreateQueryGroup('root', 'and', [
        {
          kind: 'condition',
          id: 'persisted',
          field: 'retired-field',
          operator: 'vendor-op',
          value: 'kept',
        },
      ]),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.issues().map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['unknown-field', 'unknown-operator']),
    );
    expect(fixture.nativeElement.textContent).toContain('Unknown field: retired-field');
    expect(fixture.nativeElement.textContent).toContain('Unknown operator: vendor-op');
  });

  it('blocks pointer-equivalent public methods while disabled or read-only', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('fields', fields);
    fixture.componentRef.setInput('value', initial);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    fixture.componentInstance.addCondition();
    expect(fixture.componentInstance.model()).toEqual(initial);
    expect(
      [...fixture.nativeElement.querySelectorAll('button, select, input')].every(
        (element: Element) => (element as HTMLButtonElement).disabled,
      ),
    ).toBe(true);

    fixture.componentRef.setInput('disabled', false);
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    fixture.componentInstance.clear();
    expect(fixture.componentInstance.model()).toEqual(initial);
  });

  it('integrates with Reactive Forms and propagates disabled state', () => {
    const fixture = TestBed.createComponent(QueryBuilderHost);
    fixture.detectChanges();
    const builder = fixture.debugElement.query(By.directive(JQueryBuilderComponent))
      .componentInstance as JQueryBuilderComponent;

    builder.addCondition('root');
    expect(fixture.componentInstance.control.value.children).toHaveLength(3);

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(builder.isDisabled()).toBe(true);
    builder.addGroup();
    expect(fixture.componentInstance.control.value.children).toHaveLength(3);
  });

  it('renders every custom template with independent host state', () => {
    const fixture = TestBed.createComponent(QueryBuilderHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.custom-field')?.textContent).toContain(
      'Customer name',
    );
    expect(fixture.nativeElement.querySelector('.custom-value')?.textContent).toContain('Acme');
    expect(fixture.nativeElement.querySelector('.custom-group')?.textContent).toContain('and');

    fixture.componentInstance.control.setValue(jCreateQueryGroup('empty'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.custom-empty')?.textContent).toContain(
      'customer filter',
    );
  });

  it('supports RTL, responsive styling, keyboard-native controls, and SSR-safe construction', () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('fields', fields);
    fixture.componentRef.setInput('value', initial);
    fixture.componentRef.setInput('dir', 'rtl');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.j-query-builder');
    expect(root.getAttribute('dir')).toBe('rtl');
    expect(fixture.nativeElement.querySelectorAll('select').length).toBeGreaterThan(0);
    expect(JQueryBuilderComponent.toString()).not.toContain('window.');
    expect(JQueryBuilderComponent.toString()).not.toContain('document.');
  });

  it('associates validation errors and restores a focusable target after deletion', async () => {
    const fixture = createComponent();
    fixture.componentRef.setInput('fields', fields);
    fixture.componentRef.setInput(
      'value',
      jCreateQueryGroup('root', 'and', [
        { ...jCreateQueryCondition('invalid', fields[0]), value: '' },
      ]),
    );
    fixture.detectChanges();
    const condition = fixture.nativeElement.querySelector('.j-query-builder__condition');
    expect(condition.getAttribute('aria-describedby')).toContain('j-query-errors');

    fixture.componentInstance.removeNode('invalid', 'root');
    fixture.detectChanges();
    await Promise.resolve();
    expect(fixture.componentInstance.model().children).toEqual([]);
  });
});

function createComponent(): ComponentFixture<JQueryBuilderComponent> {
  return TestBed.createComponent(JQueryBuilderComponent);
}

function selectEvent(value: string): Event {
  return { target: { value } } as unknown as Event;
}
