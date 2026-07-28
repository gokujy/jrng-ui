export type JQueryFieldType = 'text' | 'number' | 'boolean' | 'date';
export type JQueryJoin = 'and' | 'or';
export type JQueryOperatorArity = 'none' | 'single' | 'range' | 'list';
export type JQueryPrimitive = string | number | boolean | null;
export type JQueryConditionValue =
  | JQueryPrimitive
  | readonly JQueryPrimitive[]
  | { readonly from: JQueryPrimitive; readonly to: JQueryPrimitive };

export interface JQueryField {
  readonly key: string;
  readonly label: string;
  readonly type: JQueryFieldType;
  readonly operators?: readonly string[];
  readonly disabled?: boolean;
}

export interface JQueryOperator {
  readonly key: string;
  readonly label: string;
  readonly arity: JQueryOperatorArity;
  readonly fieldTypes: readonly JQueryFieldType[];
}

export interface JQueryCondition {
  readonly kind: 'condition';
  readonly id: string;
  readonly field: string;
  readonly operator: string;
  readonly value: JQueryConditionValue;
}

export interface JQueryGroup {
  readonly kind: 'group';
  readonly id: string;
  readonly join: JQueryJoin;
  readonly children: readonly JQueryNode[];
}

export type JQueryNode = JQueryGroup | JQueryCondition;

export interface JQueryValidationIssue {
  readonly code:
    | 'cycle'
    | 'depth'
    | 'duplicate-id'
    | 'unknown-field'
    | 'unknown-operator'
    | 'incompatible-operator'
    | 'missing-value'
    | 'invalid-value';
  readonly nodeId: string;
  readonly path: string;
  readonly message: string;
}

export interface JQueryNormalisationResult {
  readonly model: JQueryGroup;
  readonly issues: readonly JQueryValidationIssue[];
}

export const J_QUERY_OPERATORS: readonly JQueryOperator[] = [
  {
    key: 'equals',
    label: 'Equals',
    arity: 'single',
    fieldTypes: ['text', 'number', 'boolean', 'date'],
  },
  {
    key: 'not-equals',
    label: 'Does not equal',
    arity: 'single',
    fieldTypes: ['text', 'number', 'boolean', 'date'],
  },
  { key: 'contains', label: 'Contains', arity: 'single', fieldTypes: ['text'] },
  { key: 'starts-with', label: 'Starts with', arity: 'single', fieldTypes: ['text'] },
  { key: 'greater-than', label: 'Greater than', arity: 'single', fieldTypes: ['number', 'date'] },
  { key: 'less-than', label: 'Less than', arity: 'single', fieldTypes: ['number', 'date'] },
  { key: 'between', label: 'Between', arity: 'range', fieldTypes: ['number', 'date'] },
  { key: 'in', label: 'Is one of', arity: 'list', fieldTypes: ['text', 'number', 'date'] },
  {
    key: 'is-null',
    label: 'Is null',
    arity: 'none',
    fieldTypes: ['text', 'number', 'boolean', 'date'],
  },
  {
    key: 'is-not-null',
    label: 'Is not null',
    arity: 'none',
    fieldTypes: ['text', 'number', 'boolean', 'date'],
  },
];

export function jCreateQueryGroup(
  id: string,
  join: JQueryJoin = 'and',
  children: readonly JQueryNode[] = [],
): JQueryGroup {
  return { kind: 'group', id, join, children: [...children] };
}

export function jCreateQueryCondition(
  id: string,
  field: JQueryField | undefined,
  operators: readonly JQueryOperator[] = J_QUERY_OPERATORS,
): JQueryCondition {
  const operator = operators.find(
    (candidate) =>
      field &&
      candidate.fieldTypes.includes(field.type) &&
      (!field.operators || field.operators.includes(candidate.key)),
  );
  return {
    kind: 'condition',
    id,
    field: field?.key ?? '',
    operator: operator?.key ?? '',
    value: jDefaultQueryValue(field?.type ?? 'text', operator?.arity ?? 'single'),
  };
}

export function jDefaultQueryValue(
  type: JQueryFieldType,
  arity: JQueryOperatorArity,
): JQueryConditionValue {
  if (arity === 'none') return null;
  if (arity === 'list') return [];
  const scalar: JQueryPrimitive = type === 'number' ? 0 : type === 'boolean' ? false : '';
  return arity === 'range' ? { from: scalar, to: scalar } : scalar;
}

export function jUpdateQueryNode(
  root: JQueryGroup,
  nodeId: string,
  update: (node: JQueryNode) => JQueryNode,
): JQueryGroup {
  if (root.id === nodeId) {
    const changed = update(root);
    return changed.kind === 'group' ? changed : root;
  }
  return mapGroup(root, (node) => (node.id === nodeId ? update(node) : node));
}

export function jAppendQueryNode(
  root: JQueryGroup,
  groupId: string,
  node: JQueryNode,
): JQueryGroup {
  return jUpdateQueryNode(root, groupId, (target) =>
    target.kind === 'group' ? { ...target, children: [...target.children, node] } : target,
  );
}

export function jRemoveQueryNode(root: JQueryGroup, nodeId: string): JQueryGroup {
  if (root.id === nodeId) return root;
  return mapGroup(root, (node) => node, nodeId);
}

export function jDuplicateQueryNode(
  root: JQueryGroup,
  nodeId: string,
  createId: (kind: JQueryNode['kind']) => string,
): JQueryGroup {
  const duplicateChildren = (node: JQueryNode): JQueryNode =>
    node.kind === 'condition'
      ? { ...node, id: createId('condition'), value: cloneValue(node.value) }
      : {
          ...node,
          id: createId('group'),
          children: node.children.map(duplicateChildren),
        };

  const visit = (group: JQueryGroup): JQueryGroup => {
    const children: JQueryNode[] = [];
    for (const child of group.children) {
      const visited = child.kind === 'group' ? visit(child) : child;
      children.push(visited);
      if (child.id === nodeId) children.push(duplicateChildren(child));
    }
    return children.every((child, index) => child === group.children[index])
      ? group
      : { ...group, children };
  };
  return visit(root);
}

export function jNormaliseQueryExpression(
  value: unknown,
  fallbackId = 'query-root',
  maxDepth = 24,
): JQueryNormalisationResult {
  const issues: JQueryValidationIssue[] = [];
  const seenObjects = new WeakSet<object>();
  const ids = new Set<string>();

  const visit = (candidate: unknown, path: string, depth: number): JQueryNode | null => {
    if (!isRecord(candidate)) return null;
    const rawId = typeof candidate['id'] === 'string' && candidate['id'] ? candidate['id'] : path;
    let id = rawId;
    if (ids.has(id)) {
      issues.push({
        code: 'duplicate-id',
        nodeId: id,
        path,
        message: `Duplicate node ID "${id}" was recovered.`,
      });
      id = `${path}-${id}`;
    }
    ids.add(id);
    if (seenObjects.has(candidate)) {
      issues.push({ code: 'cycle', nodeId: id, path, message: 'A cyclic node was omitted.' });
      return null;
    }
    if (depth > maxDepth) {
      issues.push({
        code: 'depth',
        nodeId: id,
        path,
        message: `Expression depth exceeds the supported limit of ${maxDepth}.`,
      });
      return null;
    }
    seenObjects.add(candidate);
    if (candidate['kind'] === 'condition') {
      return {
        kind: 'condition',
        id,
        field: typeof candidate['field'] === 'string' ? candidate['field'] : '',
        operator: typeof candidate['operator'] === 'string' ? candidate['operator'] : '',
        value: normaliseValue(candidate['value']),
      };
    }
    const rawChildren = Array.isArray(candidate['children']) ? candidate['children'] : [];
    const children = rawChildren
      .map((child, index) => visit(child, `${path}-${index + 1}`, depth + 1))
      .filter((child): child is JQueryNode => child !== null);
    return {
      kind: 'group',
      id,
      join: candidate['join'] === 'or' ? 'or' : 'and',
      children,
    };
  };

  const root = visit(value, fallbackId, 0);
  const model =
    root?.kind === 'group' ? root : jCreateQueryGroup(fallbackId, 'and', root ? [root] : []);
  return { model, issues };
}

export function jValidateQueryExpression(
  value: unknown,
  fields: readonly JQueryField[],
  operators: readonly JQueryOperator[] = J_QUERY_OPERATORS,
): readonly JQueryValidationIssue[] {
  const normalised = jNormaliseQueryExpression(value);
  const issues = [...normalised.issues];
  const fieldMap = new Map(fields.map((field) => [field.key, field]));
  const operatorMap = new Map(operators.map((operator) => [operator.key, operator]));

  const visit = (node: JQueryNode, path: string): void => {
    if (node.kind === 'group') {
      node.children.forEach((child, index) => visit(child, `${path}.${index}`));
      return;
    }
    const field = fieldMap.get(node.field);
    const operator = operatorMap.get(node.operator);
    if (!field) {
      issues.push({
        code: 'unknown-field',
        nodeId: node.id,
        path,
        message: node.field ? `Unknown field "${node.field}".` : 'Choose a field.',
      });
    }
    if (!operator) {
      issues.push({
        code: 'unknown-operator',
        nodeId: node.id,
        path,
        message: node.operator ? `Unknown operator "${node.operator}".` : 'Choose an operator.',
      });
      return;
    }
    if (
      field &&
      (!operator.fieldTypes.includes(field.type) ||
        (field.operators && !field.operators.includes(operator.key)))
    ) {
      issues.push({
        code: 'incompatible-operator',
        nodeId: node.id,
        path,
        message: `${operator.label} cannot be used with ${field.label}.`,
      });
    }
    if (operator.arity !== 'none' && isMissing(node.value, operator.arity)) {
      issues.push({
        code: 'missing-value',
        nodeId: node.id,
        path,
        message: 'Enter a value.',
      });
    }
    if (field && !valueMatchesType(node.value, field.type, operator.arity)) {
      issues.push({
        code: 'invalid-value',
        nodeId: node.id,
        path,
        message: `The value does not match the ${field.type} field type.`,
      });
    }
  };
  visit(normalised.model, '$');
  return issues;
}

function mapGroup(
  group: JQueryGroup,
  update: (node: JQueryNode) => JQueryNode,
  removeId?: string,
): JQueryGroup {
  let changed = false;
  const children = group.children
    .filter((child) => {
      if (child.id === removeId) {
        changed = true;
        return false;
      }
      return true;
    })
    .map((child) => {
      const nested = child.kind === 'group' ? mapGroup(child, update, removeId) : child;
      const next = update(nested);
      changed ||= next !== child;
      return next;
    });
  return changed ? { ...group, children } : group;
}

function normaliseValue(value: unknown): JQueryConditionValue {
  if (Array.isArray(value)) {
    return value.filter(isPrimitive);
  }
  if (isRecord(value) && 'from' in value && 'to' in value) {
    return {
      from: isPrimitive(value['from']) ? value['from'] : null,
      to: isPrimitive(value['to']) ? value['to'] : null,
    };
  }
  return isPrimitive(value) ? value : null;
}

function cloneValue(value: JQueryConditionValue): JQueryConditionValue {
  if (Array.isArray(value)) return [...value];
  if (isRange(value)) return { ...value };
  return value;
}

function isMissing(value: JQueryConditionValue, arity: JQueryOperatorArity): boolean {
  if (arity === 'list') return !Array.isArray(value) || value.length === 0;
  if (arity === 'range') {
    return (
      !isRange(value) ||
      value.from === '' ||
      value.from === null ||
      value.to === '' ||
      value.to === null
    );
  }
  return value === '' || value === null || Array.isArray(value);
}

function valueMatchesType(
  value: JQueryConditionValue,
  type: JQueryFieldType,
  arity: JQueryOperatorArity,
): boolean {
  if (arity === 'none') return value === null;
  const values = Array.isArray(value) ? value : isRange(value) ? [value.from, value.to] : [value];
  return values.every((item) => {
    if (item === null || item === '') return true;
    if (type === 'number') return typeof item === 'number' && Number.isFinite(item);
    if (type === 'boolean') return typeof item === 'boolean';
    return typeof item === 'string';
  });
}

function isPrimitive(value: unknown): value is JQueryPrimitive {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  );
}

function isRange(
  value: JQueryConditionValue,
): value is { readonly from: JQueryPrimitive; readonly to: JQueryPrimitive } {
  return !Array.isArray(value) && isRecord(value) && 'from' in value && 'to' in value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
