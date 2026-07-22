# Table and Data Grid architecture

Data Grid composes Table and shares its typed columns, filtering, sorting, selection, editing, state, export, and server-query infrastructure. Table’s final axes are `variant`, `density`, `filterDisplay`, `selectionMode`, `dataMode`, `editMode`, and `responsiveMode`.

The host and flexible parents use `max-width: 100%` and `min-width: 0`. Toolbar and paginator sit outside the dedicated `.j-table__scroll` wrapper. The wrapper owns horizontal overflow and optional vertical `scrollHeight`; the table retains a readable minimum width and sticky headers remain aligned with body columns.

Saved state has exactly version `1`. Invalid JSON or shape is ignored, defaults remain active, and the typed non-fatal `error` output emits. No older state format is interpreted.
