import {
  documentationStatuses,
  publicItemCategories,
  publicItemIndex,
} from './public-item-index.data';

describe('publicItemIndex', () => {
  it('contains every documented component plus exported directives, pipes, and services', () => {
    expect(publicItemIndex.length).toBeGreaterThan(126);
    expect(new Set(publicItemIndex.map((item) => `${item.kind}:${item.identifier}`)).size).toBe(
      publicItemIndex.length,
    );
    expect(
      ['Component', 'Directive', 'Pipe', 'Service'].every((kind) =>
        publicItemIndex.some((item) => item.kind === kind),
      ),
    ).toBe(true);
  });

  it('uses supported categories, statuses, public imports, and documentation routes', () => {
    for (const item of publicItemIndex) {
      expect(publicItemCategories).toContain(item.category);
      expect(documentationStatuses).toContain(item.documentationStatus);
      expect(item.importPath).toMatch(/^jrng-ui(?:\/|$)/);
      expect(item.documentationRoute).toMatch(/^\/docs/);
    }
  });

  it('includes selector, category, and import-path search text', () => {
    const matches = publicItemIndex.filter((item) =>
      [item.name, item.identifier, item.category, item.description, ...item.searchTerms]
        .join(' ')
        .toLowerCase()
        .includes('jrng-ui/'),
    );
    expect(matches.length).toBeGreaterThan(0);
  });
});
