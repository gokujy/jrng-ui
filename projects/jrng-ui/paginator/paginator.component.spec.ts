import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JPaginatorChange, JPaginatorComponent, JPaginatorPageChange } from './paginator.component';

describe('JPaginatorComponent', () => {
  let component: JPaginatorComponent;
  let fixture: ComponentFixture<JPaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JPaginatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JPaginatorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('totalRecords', 95);
    fixture.componentRef.setInput('rows', 10);
    fixture.componentRef.setInput('first', 0);
    fixture.detectChanges();
  });

  it('computes page count and current page from total records and rows', () => {
    expect(component.pageCount).toBe(10);
    expect(component.currentPage).toBe(1);
  });

  it('emits pageChange with correct first/rows when moving to the next page', () => {
    let change: JPaginatorPageChange | undefined;
    component.pageChange.subscribe((event) => (change = event));

    component.setPage(component.currentPage + 1);

    expect(change).toEqual({ first: 10, rows: 10, page: 2, pageCount: 10 });
    expect(component.currentPage).toBe(2);
  });

  it('emits pageChange with correct first/rows when moving to the previous page', () => {
    component.setPage(3);
    expect(component.currentPage).toBe(3);

    let change: JPaginatorPageChange | undefined;
    component.pageChange.subscribe((event) => (change = event));

    component.setPage(component.currentPage - 1);

    expect(change).toEqual({ first: 10, rows: 10, page: 2, pageCount: 10 });
    expect(component.currentPage).toBe(2);
  });

  it('exposes JPaginatorChange page/pageSize accessors', () => {
    const snapshot: JPaginatorChange = { page: component.page, pageSize: component.pageSize };
    expect(snapshot).toEqual({ page: 1, pageSize: 10 });
  });
});
