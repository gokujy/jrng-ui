import { Component, reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JSelectionOptionSource } from 'jrng-ui/core';
import { JOrderListComponent, JOrderListReorderEvent } from './order-list.component';

@Component({
  imports: [JOrderListComponent],
  template: `
    <j-order-list [(value)]="value" [multiple]="multiple" (reorder)="reorderEvent = $event" />
  `,
})
class OrderListHostComponent {
  value: readonly JSelectionOptionSource[] = [
    { label: 'Alpha', value: 'a' },
    { label: 'Locked', value: 'locked', disabled: true },
    { label: 'Gamma', value: 'g' },
  ];
  multiple = true;
  reorderEvent: JOrderListReorderEvent | null = null;
}

describe('JOrderListComponent', () => {
  const metadata = reflectComponentType(JOrderListComponent);
  let fixture: ComponentFixture<OrderListHostComponent>;
  let host: OrderListHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [OrderListHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(OrderListHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function options(): HTMLButtonElement[] {
    return fixture.debugElement
      .queryAll(By.css('[role="option"]'))
      .map((option) => option.nativeElement as HTMLButtonElement);
  }

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-order-list');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('uses one tab stop and skips disabled options during keyboard navigation', () => {
    expect(options().map((option) => option.tabIndex)).toEqual([0, -1, -1]);
    options()[0]?.focus();
    options()[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(options()[2]);

    options()[2]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(options()[0]);
  });

  it('reports single-selection semantics when multiple selection is disabled', () => {
    host.multiple = false;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(
      fixture.debugElement
        .query(By.css('[role="listbox"]'))
        .nativeElement.getAttribute('aria-multiselectable'),
    ).toBe('false');
  });

  it('reorders selected values once and updates two-way binding', () => {
    options()[0]?.click();
    const component = fixture.debugElement.query(By.directive(JOrderListComponent))
      .componentInstance as JOrderListComponent;
    component.moveBottom();
    fixture.detectChanges();

    expect(host.value.map((item) => (item as { value: string }).value)).toEqual([
      'locked',
      'g',
      'a',
    ]);
    expect(host.reorderEvent?.from).toBe(0);
    expect(host.reorderEvent?.to).toBe(2);
  });
});
