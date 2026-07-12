import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JSelectionOptionSource } from 'jrng-ui/core';
import { JPickListComponent } from './pick-list.component';

@Component({
  imports: [JPickListComponent],
  template: `
    <j-pick-list
      [source]="source"
      [target]="target"
      [filter]="true"
      (sourceChange)="source = $event"
      (targetChange)="target = $event"
    />
  `,
})
class PickListHostComponent {
  source: readonly JSelectionOptionSource[] = [
    { label: 'Customer', value: 'customer' },
    { label: 'Status', value: 'status' },
  ];
  target: readonly JSelectionOptionSource[] = [{ label: 'Order', value: 'order' }];
}

describe('JPickListComponent', () => {
  let fixture: ComponentFixture<PickListHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PickListHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(PickListHostComponent);
    fixture.detectChanges();
  });

  it('renders its own compact picker instead of nesting a transfer list', () => {
    expect(fixture.debugElement.query(By.css('.j-pick-list'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('j-transfer-list'))).toBeNull();
  });

  it('adds an available item to the selected collection', () => {
    const addButton = fixture.debugElement.query(By.css('[aria-label="Add Customer"]'));
    addButton.triggerEventHandler('click');
    fixture.detectChanges();

    expect(fixture.componentInstance.source).toEqual([{ label: 'Status', value: 'status' }]);
    expect(fixture.componentInstance.target).toEqual([
      { label: 'Order', value: 'order' },
      { label: 'Customer', value: 'customer' },
    ]);
  });

  it('filters available options without changing the selected collection', () => {
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = 'status';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Status');
    expect(fixture.nativeElement.textContent).not.toContain('Customer');
    expect(fixture.componentInstance.target).toHaveLength(1);
  });
});
