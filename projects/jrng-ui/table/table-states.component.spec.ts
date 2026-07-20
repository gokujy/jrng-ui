import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTableComponent } from './table.component';
import {
  JTableEmptyTemplateDirective,
  JTableLoadingTemplateDirective,
} from './table-template.directive';
import {
  JTableColumn,
  JTableEmptyActionEvent,
  JTableLoadingVariant,
  JTableRow,
  JTableVariant,
} from './table.types';

@Component({
  imports: [JTableComponent],
  template: `
    <j-table
      [columns]="columns"
      [value]="rows"
      [loading]="loading"
      [loadingVariant]="loadingVariant"
      [skeletonRows]="skeletonRows"
      [globalFilter]="globalFilter"
      [errorState]="error"
      [emptyActionLabel]="actionLabel"
      [variant]="variant"
      [density]="density"
      [paginator]="paginator"
      (emptyAction)="emptyEvent = $event"
    />
  `,
})
class TableStateHostComponent {
  columns: readonly JTableColumn[] = [
    { field: 'name', header: 'Name' },
    { field: 'status', header: 'Status' },
  ];
  rows: readonly JTableRow[] = [];
  loading = false;
  loadingVariant: JTableLoadingVariant = 'skeleton';
  skeletonRows = 4;
  globalFilter = '';
  error: unknown = null;
  actionLabel = '';
  emptyEvent: JTableEmptyActionEvent | null = null;
  variant: JTableVariant = 'standard';
  density: 'compact' | 'comfortable' | 'spacious' = 'comfortable';
  paginator = false;
}

@Component({
  imports: [JTableComponent, JTableEmptyTemplateDirective, JTableLoadingTemplateDirective],
  template: `
    <j-table [columns]="columns" [value]="rows" [loading]="loading">
      <ng-template jTableLoading let-variant>
        <span class="custom-loading">Loading with {{ variant }}</span>
      </ng-template>
      <ng-template jTableEmpty let-state>
        <span class="custom-empty">Empty state: {{ state }}</span>
      </ng-template>
    </j-table>
  `,
})
class CustomTableStateHostComponent {
  columns: readonly JTableColumn[] = [{ field: 'name', header: 'Name' }];
  rows: readonly JTableRow[] = [];
  loading = true;
}

describe('JTableComponent integrated states', () => {
  let fixture: ComponentFixture<TableStateHostComponent>;
  let host: TableStateHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableStateHostComponent, CustomTableStateHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TableStateHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function refresh(): void {
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  }

  it('renders the requested skeleton row count without flashing the empty state', () => {
    host.loading = true;
    refresh();

    expect(fixture.debugElement.queryAll(By.css('.j-table-skeleton__row'))).toHaveLength(4);
    expect(fixture.debugElement.query(By.css('j-table-empty-state'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.j-table'))?.attributes['aria-busy']).toBe('true');
  });

  it('switches from loading to data', () => {
    host.loading = true;
    refresh();
    host.rows = [{ name: 'Quarterly report', status: 'Ready' }];
    host.loading = false;
    refresh();

    expect(fixture.nativeElement.textContent).toContain('Quarterly report');
    expect(fixture.debugElement.query(By.css('[data-jc-section="loading"]'))).toBeNull();
  });

  it('distinguishes no-data, no-results and error states', () => {
    expect(fixture.nativeElement.textContent).toContain('No records');

    host.rows = [{ name: 'Quarterly report', status: 'Ready' }];
    host.globalFilter = 'missing';
    refresh();
    expect(fixture.nativeElement.textContent).toContain('No matching records');

    host.error = new Error('The service is unavailable.');
    refresh();
    expect(fixture.nativeElement.textContent).toContain('Unable to load records');
    expect(fixture.nativeElement.textContent).toContain('The service is unavailable.');
  });

  it('emits the integrated empty action event', () => {
    host.actionLabel = 'Create record';
    refresh();
    (
      fixture.debugElement.query(By.css('j-table-empty-state button')).nativeElement as HTMLElement
    ).click();
    fixture.detectChanges();

    expect(host.emptyEvent?.state).toBe('no-data');
  });

  it('applies visual variant and density classes independently', () => {
    host.variant = 'gridlines';
    host.density = 'compact';
    refresh();
    const table = fixture.debugElement.query(By.css('.j-table'));

    expect(table.classes['j-table--gridlines']).toBe(true);
    expect(table.classes['j-table--density-compact']).toBe(true);
  });

  it('preserves data dimensions with overlay loading', () => {
    host.rows = [{ name: 'Quarterly report', status: 'Ready' }];
    host.loading = true;
    host.loadingVariant = 'overlay';
    refresh();

    expect(fixture.nativeElement.textContent).toContain('Quarterly report');
    expect(fixture.debugElement.query(By.css('.j-table__loading-overlay'))).toBeTruthy();
  });

  it('keeps pagination usable with an empty result set', () => {
    host.paginator = true;
    refresh();
    expect(fixture.debugElement.query(By.css('j-paginator'))).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('No records');
  });

  it('renders custom loading and empty templates', () => {
    const customFixture = TestBed.createComponent(CustomTableStateHostComponent);
    customFixture.detectChanges();
    expect(customFixture.debugElement.query(By.css('.custom-loading'))).toBeTruthy();

    customFixture.componentInstance.loading = false;
    customFixture.changeDetectorRef.markForCheck();
    customFixture.detectChanges();
    expect(
      customFixture.debugElement.query(By.css('.custom-empty'))?.nativeElement.textContent,
    ).toContain('no-data');
  });
});
