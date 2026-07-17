# Migrating to 0.0.9

## Metric Card composition

`j-metric-card` remains available for compatibility but is deprecated for new work. Compose metrics with `j-card` and focused content components. This keeps Card flexible and avoids metric-only public inputs.

```html
<j-card title="Monthly revenue" subtitle="Compared with last month">
  <strong class="metric-value">$84,250</strong>
  <j-badge value="+12.4%" severity="success" />
  <j-progress-bar [value]="72" label="72% of target" />
</j-card>
```

## Additive component APIs

Button, Avatar, and Loader additions are opt-in. Existing Button variants, non-zoomable Avatars, and Loader `variant` usage remain supported. Prefer Loader `type` in new code; `variant` remains a compatibility alias.

## Table family

There is no required Table migration. Existing `j-table`, `j-tree-table`, `j-column`, `j-table-empty-state`, and `j-table-skeleton` consumers continue to compile.

For new code, define flat columns with `JTableColumn<T>`, place empty and error handling on `j-table`, and select loading through `[loading]` plus `loadingVariant`. Use the focused header, cell, filter, action, empty, and loading template directives for customization.

The column, table-empty-state, and table-skeleton selectors remain temporary compatibility APIs. They are deprecated for new Table implementations but are not removed in this release. The general `j-skeleton` remains reusable outside tables.

Keep hierarchical data in the separate `j-tree-table`; hierarchy is not a Table variant. Loading, empty, error, selection, pagination, and editability are also states or behavior rather than visual variants.

Version 0.0.9 preserves existing selectors, modular entrypoints, CSS classes, form outputs, and primary event names. No new mandatory runtime dependency is introduced; Chart.js and Driver.js remain optional peers.

## Editor values

No consumer change is normally required. Initial and programmatic HTML values are now preserved and sanitized even when written before the editable view exists. Unsupported or unsafe stored markup may render with those nodes or attributes removed. `writeValue` no longer produces public change emissions.

## Number formatting

`j-input-number` now treats `locale`, `minFractionDigits`, and `maxFractionDigits` as functional formatting inputs. The form model remains `number | null`; do not expect a formatted string in form state. Bounds clamp on blur or keyboard stepping rather than during partial typing.

## Upload modes

With `customUpload`, selection and upload events expose validated files while queue status remains consumer-managed through `setProgress`, `setComplete`, `setError`, cancel, retry, and remove APIs. With `customUpload="false"`, starting upload transitions queue items to `uploading`. File count and total-size limits are available through `maxFileCount` and `maxTotalSize`.

## Overlays

`appendTo` accepts `'self'`, `'body'`, an element, or a selector. Invalid selectors fall back locally. Component values override `provideJrngUI({ appendTo })`.

## Deprecated compatibility inputs

- `JTimePickerComponent.timeOnly` is deprecated. The component has always been inherently time-only, so `false` cannot select a meaningful alternate mode. Use Date Picker or Date Range Picker when a date is required.
- `JrngConfig.unstyled` is retained as a root styling hook, but is deprecated as a promise to remove every component style; accessibility-critical layout and focus styling remains.

## Tooling

Contributors should use Node 22.12 (the `.nvmrc` default), Node 20.19+, or Node 24+. Release validation now includes clean-package consumer and SSR prerender builds.
