# Query Builder

`j-query-builder` authors a typed, immutable Boolean-expression tree. It never executes queries, connects to data, or generates SQL. Import it from `jrng-ui/query-builder`.

## Basic Query Builder

```ts
import {
  JQueryBuilderComponent,
  JQueryField,
  JQueryGroup,
  jCreateQueryGroup,
} from 'jrng-ui/query-builder';

fields: readonly JQueryField[] = [
  { key: 'customer', label: 'Customer', type: 'text' },
  { key: 'total', label: 'Order total', type: 'number' },
  { key: 'active', label: 'Active', type: 'boolean' },
  { key: 'created', label: 'Created', type: 'date' },
];
query: JQueryGroup = jCreateQueryGroup('customer-root');
```

```html
<j-query-builder
  label="Customer search"
  ariaLabel="Customer search query"
  [fields]="fields"
  [value]="query"
  (valueChange)="query = $event"
/>
```

Every example must declare its own value object. Do not share a mutable group between examples.

## Nested AND/OR groups

Create groups with `jCreateQueryGroup` and conditions with `jCreateQueryCondition`. A group uses `join: 'and'` for “all conditions” and `join: 'or'` for “any condition.” IDs remain stable when controlled values return to the component.

## Customer and audit-log search

Customer search can combine names, totals, status, and dates. Audit-log fields should constrain their `operators` list so, for example, an event code cannot accidentally use a numeric comparison. Retired fields/operators remain visible as validation errors so the application can migrate persisted models.

## Field types and operator arity

The first release supports text, number, boolean, and date fields. Operators declare `none`, `single`, `range`, or `list` arity. Null checks use no value; `between` uses a range; `in` uses a list.

## Custom operator

```ts
operators = [
  ...J_QUERY_OPERATORS,
  {
    key: 'matches-policy',
    label: 'Matches policy',
    arity: 'single',
    fieldTypes: ['text'],
  },
] satisfies readonly JQueryOperator[];
```

The application owns evaluation semantics. The component only authors and validates the neutral model.

## Custom templates

```html
<j-query-builder [fields]="fields" [value]="query">
  <ng-template #jQueryValueEditor let-condition let-update="update">
    <app-policy-value [value]="condition.value" (valueChange)="update($event)" />
  </ng-template>
</j-query-builder>
```

The other template references are `#jQueryField`, `#jQueryGroupHeader`, and `#jQueryEmpty`.

## Controlled value and Reactive Forms

`valueChange` emits a new JSON-safe root without mutating the previous value. For forms:

```ts
control = new FormControl<JQueryGroup>(jCreateQueryGroup('form-root'), {
  nonNullable: true,
});
```

```html
<j-query-builder [fields]="fields" [formControl]="control" />
```

Validation issues are exposed under the `queryExpression` validator key and through `validationChange`.

## Disabled, read-only, and validation

Disabled blocks pointer, keyboard, CVA, and public-method mutations. Read-only removes mutation actions and disables value controls while keeping the expression understandable. Unknown metadata, missing values, incompatible operators, duplicate IDs, cycles, and excessive nesting are recoverable validation issues.

## Responsive layout and RTL

Conditions stack below 760px. Logical margin and border properties mirror hierarchy in RTL. Field keys, values, dates, and serialised model order are never reversed.

## Accessibility and keyboard support

- Provide a concise `ariaLabel` for the full builder.
- Groups announce root/nested scope and AND/OR meaning.
- Conditions and errors are associated with accessible names.
- Tab follows the depth-first linear reading order.
- Enter/Space activates JRNG buttons; selects retain native arrow-key and Escape behavior.
- Add/remove operations are announced politely and deletion restores focus to the parent group.
- Hierarchy is conveyed by grouping, text, border, and indentation—not colour alone.

## Theming

Use `--j-query-builder-bg`, `--j-query-builder-border`, `--j-query-builder-group-accent`, `--j-query-builder-indent`, `--j-query-builder-error`, and `--j-query-builder-focus`. Defaults inherit JRNG semantic theme tokens.

## API

Primary inputs are `value`, `fields`, `operators`, `label`, `ariaLabel`, `disabled`, `readonly`, and `dir`. Outputs are `valueChange` and `validationChange`. Public operations are `addCondition`, `addGroup`, `removeNode`, `duplicateNode`, `clear`, and `validateExpression`.

## Testing

Test JSON round trips, immutable reference changes, type/operator resets, unknown metadata, cyclic persisted input, keyboard-only editing, focus after deletion, templates, forms, disabled/read-only behavior, RTL, narrow containers, SSR, and large trees. Backend evaluation requires separate application tests.

## FAQ

**Should this replace Filter Bar?** No. Use Filter Bar for a small fixed search form.

**Does it generate SQL?** No. Keep serializers outside the component and validate models at the trust boundary.

**Can operators be extended?** Yes, when the application also owns their evaluation semantics and value-editor behavior.

## Changelog

- 0.1.0 advanced-components Phase 1: initial typed expression authoring, nesting, recovery validation, templates, forms, RTL, responsive layout, and accessibility.
