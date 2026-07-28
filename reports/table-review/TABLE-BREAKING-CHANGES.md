# Table Breaking Changes

Date: 2026-07-28

## Intentional breaking changes

None.

## Additive APIs

- `scrollable: boolean`
- `tableStyle: Readonly<Record<string, string | number | null | undefined>> | null`
- `tableStyleClass: string`
- `scrollLabel: string`
- `JTableColumn.frozenAlign` additionally accepts `start` and `end`

## Behavioral corrections

- Scroll responsive mode no longer hides columns based on `responsivePriority`. Applications that
  intentionally relied on this undocumented hiding should use explicit column visibility or the
  separately selected `stack`/`card` responsive mode.
- Nested paths such as `account.name` now resolve consistently for display, sorting, and filtering.
- Frozen `left`/`right` compatibility values now map to logical start/end behavior. Use explicit
  `start`/`end` in new RTL-aware code.
- `scrollHeight="flex"` now fills the available flex height instead of emitting invalid CSS.

## Migration guidance

No migration is required for ordinary tables. For deterministic horizontal overflow:

```html
<j-table
  [value]="rows"
  [columns]="columns"
  [scrollable]="true"
  [tableStyle]="{ 'min-width': '90rem' }"
/>
```

Ensure every grid/flex ancestor that must shrink has `min-width: 0`; for flexible vertical height,
also set `min-height: 0` on the containing flex/grid child.
