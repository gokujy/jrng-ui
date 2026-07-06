import { describe, expect, it } from 'vitest';
import { jFilterBy, jMatchesFilter } from './filter';

describe('jMatchesFilter', () => {
  it('empty filter always matches', () => {
    expect(jMatchesFilter('anything', '')).toBe(true);
    expect(jMatchesFilter('anything', null)).toBe(true);
  });

  it('text modes are case-insensitive', () => {
    expect(jMatchesFilter('Hello World', 'hello', 'contains')).toBe(true);
    expect(jMatchesFilter('Hello World', 'WORLD', 'endsWith')).toBe(true);
    expect(jMatchesFilter('Hello World', 'hello', 'startsWith')).toBe(true);
    expect(jMatchesFilter('Hello', 'hello', 'equals')).toBe(true);
    expect(jMatchesFilter('Hello', 'nope', 'notContains')).toBe(true);
  });

  it('comparison modes coerce to numbers', () => {
    expect(jMatchesFilter(5, 3, 'gt')).toBe(true);
    expect(jMatchesFilter(3, 3, 'gte')).toBe(true);
    expect(jMatchesFilter(2, 3, 'lt')).toBe(true);
    expect(jMatchesFilter(5, [3, 10], 'between')).toBe(true);
    expect(jMatchesFilter(11, [3, 10], 'between')).toBe(false);
  });
});

describe('jFilterBy', () => {
  const rows = [
    { name: 'Alice', role: 'admin' },
    { name: 'Bob', role: 'editor' },
    { name: 'Carol', role: 'admin' },
  ];

  it('matches across multiple fields (OR)', () => {
    expect(jFilterBy(rows, 'admin', ['name', 'role'])).toHaveLength(2);
    expect(jFilterBy(rows, 'bob', ['name', 'role'])).toHaveLength(1);
  });

  it('supports accessor functions and empty query', () => {
    expect(jFilterBy(rows, 'a', [(r) => r.name])).toHaveLength(2); // Alice, Carol
    expect(jFilterBy(rows, '', ['name'])).toHaveLength(3);
  });
});
