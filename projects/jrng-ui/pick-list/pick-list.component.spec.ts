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

@Component({
  imports: [JPickListComponent],
  template: `
    <j-pick-list [source]="source" [target]="target">
      <ng-template #jPickListAdd let-item>
        <span data-action="add">+ {{ item.label }}</span>
      </ng-template>
      <ng-template #jPickListAddAll><span data-action="add-all">++</span></ng-template>
      <ng-template #jPickListRemove><span data-action="remove">−</span></ng-template>
      <ng-template #jPickListClear><span data-action="clear">Clear selection</span></ng-template>
      <ng-template #jPickListMoveUp><span data-action="up">↑</span></ng-template>
      <ng-template #jPickListMoveDown><span data-action="down">↓</span></ng-template>
    </j-pick-list>
  `,
})
class CustomPickListHostComponent {
  readonly source: readonly JSelectionOptionSource[] = [{ label: 'Customer', value: 'customer' }];
  readonly target: readonly JSelectionOptionSource[] = [{ label: 'Order', value: 'order' }];
}

describe('JPickListComponent', () => {
  let fixture: ComponentFixture<PickListHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickListHostComponent, CustomPickListHostComponent],
    }).compileComponents();
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

  it('keeps readable action labels by default', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Add all');
    expect(text).toContain('Add');
    expect(text).toContain('Up');
    expect(text).toContain('Down');
    expect(text).toContain('Remove');
    expect(text).toContain('Clear');
  });

  it('accepts arbitrary projected content for every action without losing aria labels', () => {
    const customFixture = TestBed.createComponent(CustomPickListHostComponent);
    customFixture.detectChanges();

    const actions = customFixture.nativeElement.querySelectorAll('[data-action]');
    expect(actions).toHaveLength(6);
    expect(customFixture.nativeElement.textContent).toContain('+ Customer');
    expect(customFixture.nativeElement.querySelector('[aria-label="Add Customer"]')).not.toBeNull();
    expect(customFixture.nativeElement.querySelector('[aria-label="Remove Order"]')).not.toBeNull();
  });
});
