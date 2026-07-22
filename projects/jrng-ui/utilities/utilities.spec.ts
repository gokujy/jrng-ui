import {
  buildTree,
  changedFields,
  chunk,
  compareDates,
  convertBytes,
  deepMerge,
  equalsIgnoreCase,
  flattenTree,
  generateDownloadFilename,
  generateInitials,
  getFileExtension,
  groupBy,
  isValidDateRange,
  normalizeSearchText,
  removeNullish,
  sanitizeFilename,
  slugify,
  sortBy,
  toQueryParams,
  uniqueBy,
} from './public-api';

describe('enterprise utilities', () => {
  it('handles collections without mutating inputs', () => {
    const values = [
      { id: 2, kind: 'b' },
      { id: 1, kind: 'a' },
      { id: 2, kind: 'b' },
    ];
    expect(groupBy(values, (item) => item.kind)['b']).toHaveLength(2);
    expect(uniqueBy(values, (item) => item.id)).toHaveLength(2);
    expect(sortBy(values, (item) => item.id)[0]?.id).toBe(1);
    expect(chunk(values, 2)).toHaveLength(2);
  });

  it('builds and flattens trees', () => {
    interface Node {
      id: number;
      parent: number | null;
      children: Node[];
    }
    const tree = buildTree<Node, number>(
      [
        { id: 1, parent: null, children: [] },
        { id: 2, parent: 1, children: [] },
      ],
      (item) => item.id,
      (item) => item.parent,
      (item, children) => ({ ...item, children }),
    );
    expect(flattenTree(tree, (item) => item.children).map((item) => item.id)).toEqual([1, 2]);
  });

  it('handles objects safely', () => {
    expect(removeNullish({ a: 1, b: null })).toEqual({ a: 1 });
    expect(
      deepMerge({ a: { b: 1 } }, JSON.parse('{"a":{"c":2},"__proto__":{"polluted":true}}')),
    ).toEqual({ a: { b: 1, c: 2 } });
    expect(changedFields({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
    expect(toQueryParams({ a: [1, 2], b: null }).toString()).toBe('a=1&a=2');
  });

  it('handles strings, dates, and files', () => {
    expect(generateInitials('Ada Lovelace')).toBe('AL');
    expect(normalizeSearchText('  CAFÉ ')).toBe('cafe');
    expect(slugify('Hello, World!')).toBe('hello-world');
    expect(equalsIgnoreCase('Test', 'test')).toBe(true);
    expect(sanitizeFilename('a/b?.pdf')).toBe('a-b-.pdf');
    expect(isValidDateRange('2025-01-01', '2025-01-02')).toBe(true);
    expect(compareDates('bad', new Date())).toBeNull();
    expect(getFileExtension('report.PDF')).toBe('pdf');
    expect(convertBytes(1024)).toBe('1.0 KB');
    expect(generateDownloadFilename('report', '.pdf')).toBe('report.pdf');
  });
});
