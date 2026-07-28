import {
  ExpandableFilterPanelTableComponent,
  FiltersAboveTableComponent,
  InlineColumnFiltersTableComponent,
} from './table-filter-examples.component';

describe('table filtering documentation examples', () => {
  it('keeps data and filtering state independent for every example instance', () => {
    const first = new FiltersAboveTableComponent();
    const second = new FiltersAboveTableComponent();

    first.search.set('NORTHWIND');
    first.applyFilters();

    expect(first.visibleRows()).toHaveLength(1);
    expect(second.visibleRows()).toHaveLength(12);
    expect(first.rows).not.toBe(second.rows);
  });

  it('combines toolbar filters case-insensitively and restores all rows when cleared', () => {
    const example = new FiltersAboveTableComponent();

    example.search.set('technology');
    example.manager.set('Avery Reed');
    example.applyFilters();

    expect(example.visibleRows().map((row) => row['customerId'])).toEqual(['CUS-1001', 'CUS-1007']);

    example.clearAll();
    expect(example.visibleRows()).toHaveLength(12);
    expect(example.activeChips()).toHaveLength(0);
  });

  it('starts the advanced panel closed and preserves entered values while toggled', () => {
    const example = new ExpandableFilterPanelTableComponent();

    expect(example.panelOpen()).toBe(false);
    example.customer.set('avery');
    example.panelOpen.set(true);
    example.panelOpen.set(false);

    expect(example.customer()).toBe('avery');
  });

  it('owns loading and empty-result state in the inline example', () => {
    const example = new InlineColumnFiltersTableComponent();

    example.toggleInlineLoading();
    expect(example.inlineState()).toBe('loading');
    example.toggleInlineEmpty();
    expect(example.inlineState()).toBe('empty');
  });
});
