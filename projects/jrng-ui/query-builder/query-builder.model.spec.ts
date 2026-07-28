import { describe, expect, it } from 'vitest';
import {
  JQueryField,
  JQueryGroup,
  J_QUERY_OPERATORS,
  jAppendQueryNode,
  jCreateQueryCondition,
  jCreateQueryGroup,
  jDuplicateQueryNode,
  jNormaliseQueryExpression,
  jRemoveQueryNode,
  jUpdateQueryNode,
  jValidateQueryExpression,
} from './query-builder.model';

const fields: readonly JQueryField[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'active', label: 'Active', type: 'boolean' },
  { key: 'created', label: 'Created', type: 'date' },
];

describe('query builder model', () => {
  it('adds, updates, and removes nested nodes immutably', () => {
    const root = jCreateQueryGroup('root');
    const nested = jCreateQueryGroup('nested', 'or');
    const withGroup = jAppendQueryNode(root, root.id, nested);
    const condition = jCreateQueryCondition('condition', fields[0]);
    const withCondition = jAppendQueryNode(withGroup, nested.id, condition);
    const updated = jUpdateQueryNode(withCondition, condition.id, (node) =>
      node.kind === 'condition' ? { ...node, value: 'Acme' } : node,
    );
    const removed = jRemoveQueryNode(updated, condition.id);

    expect(root.children).toEqual([]);
    expect(withGroup).not.toBe(root);
    expect((withCondition.children[0] as JQueryGroup).children).toHaveLength(1);
    expect(((updated.children[0] as JQueryGroup).children[0] as { value: unknown }).value).toBe(
      'Acme',
    );
    expect((removed.children[0] as JQueryGroup).children).toEqual([]);
  });

  it('duplicates a complete subtree with fresh stable IDs', () => {
    const source = jCreateQueryGroup('nested', 'or', [
      jCreateQueryCondition('condition', fields[1]),
    ]);
    const root = jCreateQueryGroup('root', 'and', [source]);
    let id = 0;
    const duplicated = jDuplicateQueryNode(root, 'nested', (kind) => `${kind}-${++id}`);
    const copy = duplicated.children[1] as JQueryGroup;

    expect(copy).toMatchObject({ kind: 'group', id: 'group-1', join: 'or' });
    expect(copy.children[0]).toMatchObject({ kind: 'condition', id: 'condition-2' });
    expect(copy).not.toBe(source);
  });

  it('recovers cycles, duplicate IDs, excessive depth, and malformed nodes', () => {
    const cyclic: Record<string, unknown> = {
      kind: 'group',
      id: 'root',
      join: 'and',
      children: [],
    };
    (cyclic['children'] as unknown[]).push(cyclic, {
      kind: 'condition',
      id: 'root',
      field: 'name',
      operator: 'equals',
      value: 'A',
    });

    const result = jNormaliseQueryExpression(cyclic, 'fallback', 2);

    expect(result.model.children).toHaveLength(1);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['cycle', 'duplicate-id']),
    );
    expect(() => JSON.stringify(result.model)).not.toThrow();
  });

  it('validates unknown fields, operators, incompatible types, null, range, and list semantics', () => {
    const model = jCreateQueryGroup('root', 'and', [
      {
        kind: 'condition',
        id: 'unknown',
        field: 'missing',
        operator: 'missing-op',
        value: null,
      },
      {
        kind: 'condition',
        id: 'wrong-type',
        field: 'amount',
        operator: 'contains',
        value: 'ten',
      },
      {
        kind: 'condition',
        id: 'empty-list',
        field: 'name',
        operator: 'in',
        value: [],
      },
      {
        kind: 'condition',
        id: 'null-check',
        field: 'active',
        operator: 'is-null',
        value: null,
      },
    ]);

    const issues = jValidateQueryExpression(model, fields);

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        'unknown-field',
        'unknown-operator',
        'incompatible-operator',
        'invalid-value',
        'missing-value',
      ]),
    );
    expect(issues.some((issue) => issue.nodeId === 'null-check')).toBe(false);
  });

  it('round trips a large JSON-safe expression without changing IDs', () => {
    const children = Array.from({ length: 250 }, (_, index) => ({
      ...jCreateQueryCondition(`condition-${index}`, fields[index % fields.length]),
      value: fields[index % fields.length]?.type === 'number' ? index : `value-${index}`,
    }));
    const model = jCreateQueryGroup('root', 'and', children);
    const result = jNormaliseQueryExpression(JSON.parse(JSON.stringify(model)));

    expect(result.issues).toEqual([]);
    expect(result.model).toEqual(model);
    expect(result.model.children[249]?.id).toBe('condition-249');
  });

  it('uses the original JRNG operator vocabulary and supports all required arities', () => {
    expect(new Set(J_QUERY_OPERATORS.map((operator) => operator.arity))).toEqual(
      new Set(['none', 'single', 'range', 'list']),
    );
    expect(J_QUERY_OPERATORS.some((operator) => operator.key === 'between')).toBe(true);
    expect(J_QUERY_OPERATORS.some((operator) => operator.key === 'is-null')).toBe(true);
  });
});
