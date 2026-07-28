import { reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JDataViewComponent } from './data-view.component';

interface DataItem {
  readonly id: number;
  readonly amount: number;
}

describe('JDataViewComponent', () => {
  const metadata = reflectComponentType(JDataViewComponent);
  let fixture: ComponentFixture<JDataViewComponent<DataItem>>;
  let component: JDataViewComponent<DataItem>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [JDataViewComponent] });
    fixture = TestBed.createComponent(JDataViewComponent<DataItem>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sortOptions', [{ field: 'amount', label: 'Amount' }]);
    fixture.componentRef.setInput('value', [
      { id: 1, amount: 10 },
      { id: 2, amount: 2 },
    ]);
    fixture.detectChanges();
  });

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-data-view');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('sorts numeric fields numerically', () => {
    component.sortField = 'amount';
    expect(component.sortedItems.map((item) => item.amount)).toEqual([2, 10]);
  });

  it('normalizes invalid pagination and clamps a stale page after data shrinks', () => {
    component.rows = 0;
    component.first = 50;
    expect(component.resolvedRows).toBe(1);
    expect(component.resolvedFirst).toBe(1);
    expect(component.pageItems).toEqual([{ id: 2, amount: 2 }]);

    fixture.componentRef.setInput('value', [{ id: 1, amount: 10 }]);
    expect(component.resolvedFirst).toBe(0);
    expect(component.pageItems).toEqual([{ id: 1, amount: 10 }]);
  });

  it('labels sorting and exposes the active layout as a pressed toggle', () => {
    const select = fixture.debugElement.query(By.css('select')).nativeElement as HTMLSelectElement;
    const buttons = fixture.debugElement
      .queryAll(By.css('.j-data-view__toggle button'))
      .map((button) => button.nativeElement as HTMLButtonElement);

    expect(select.getAttribute('aria-label')).toBe('Sort items');
    expect(buttons[0]?.getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1]?.getAttribute('aria-pressed')).toBe('false');
  });
});
