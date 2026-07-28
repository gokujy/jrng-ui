import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JPaginatorComponent, JPaginatorPageChange } from './paginator.component';

describe('JPaginatorComponent variants', () => {
  let fixture: ComponentFixture<JPaginatorComponent>;
  let component: JPaginatorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [JPaginatorComponent] }).compileComponents();
    fixture = TestBed.createComponent(JPaginatorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('totalRecords', 75);
    fixture.componentRef.setInput('rows', 10);
  });

  it('computes page count and current page from total records and rows', () => {
    fixture.componentRef.setInput('totalRecords', 95);
    fixture.detectChanges();
    expect(component.pageCount).toBe(10);
    expect(component.currentPage).toBe(1);
  });

  it('emits pageChange with correct first and rows when changing pages', () => {
    fixture.componentRef.setInput('totalRecords', 95);
    fixture.detectChanges();
    let change: JPaginatorPageChange | undefined;
    component.pageChange.subscribe((event) => (change = event));
    component.setPage(2);
    expect(change).toEqual({ first: 10, rows: 10, page: 2, pageCount: 10 });
    expect(component.currentPage).toBe(2);
  });

  it('shows a concise page hierarchy only for the simple variant', () => {
    fixture.componentRef.setInput('variant', 'simple');
    fixture.detectChanges();
    const root = fixture.debugElement.query(By.css('nav')).nativeElement as HTMLElement;
    expect(root.dataset['jVariant']).toBe('simple');
    expect(
      fixture.debugElement.query(By.css('.j-paginator__page-count')).nativeElement.textContent,
    ).toContain('Page 1 of 8');
  });

  it('preserves page events and disabled boundary states', () => {
    fixture.detectChanges();
    const emitted: unknown[] = [];
    fixture.componentInstance.pageChange.subscribe((event) => emitted.push(event));
    const previous = fixture.debugElement.query(By.css('[aria-label="Previous page"]'));
    expect((previous.nativeElement as HTMLButtonElement).disabled).toBe(true);
    fixture.debugElement.query(By.css('[aria-label="Next page"]')).triggerEventHandler('click');
    expect(emitted).toHaveLength(1);
  });

  it('normalizes non-finite and negative pagination inputs', () => {
    fixture.componentRef.setInput('totalRecords', -10);
    fixture.componentRef.setInput('rows', 0);
    fixture.componentRef.setInput('first', Number.POSITIVE_INFINITY);
    fixture.componentRef.setInput('pageLinkSize', Number.POSITIVE_INFINITY);
    fixture.detectChanges();

    expect(component.pageCount).toBe(1);
    expect(component.currentPage).toBe(1);
    expect(component.pageLinks).toEqual([1]);
    expect(component.currentReport).toContain('Showing 0 to 0 of 0');
  });

  it('does not emit NaN when a programmatic page is invalid', () => {
    fixture.detectChanges();
    let change: JPaginatorPageChange | undefined;
    component.pageChange.subscribe((event) => (change = event));

    component.setPage(Number.NaN);

    expect(change).toEqual({ first: 0, rows: 10, page: 1, pageCount: 8 });
  });
});
