import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JColumnComponent } from './column.component';
import { JTableEmptyStateComponent } from './table-empty-state.component';
import { JTableSkeletonComponent } from './table-skeleton.component';
import { JTableComponent } from './table.component';

@Component({
  imports: [JColumnComponent, JTableComponent, JTableEmptyStateComponent, JTableSkeletonComponent],
  template: `
    <j-table [value]="rows">
      <j-column field="name" header="Name" [sortable]="true" />
    </j-table>
    <j-table-empty-state message="No compatible rows" />
    <j-table-skeleton [rows]="3" [columns]="2" />
  `,
})
class CompatibilityHostComponent {
  readonly rows = [{ name: 'Compatible record' }];
}

describe('Table compatibility APIs', () => {
  let fixture: ComponentFixture<CompatibilityHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompatibilityHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CompatibilityHostComponent);
    fixture.detectChanges();
  });

  it('keeps legacy column metadata rendering through j-table', () => {
    expect(fixture.nativeElement.querySelector('th')?.textContent).toContain('Name');
    expect(fixture.nativeElement.querySelector('td')?.textContent).toContain('Compatible record');
  });

  it('keeps the table empty and skeleton compatibility selectors available', () => {
    expect(fixture.nativeElement.querySelector('j-table-empty-state')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.j-table-skeleton__row').length).toBe(3);
  });
});
