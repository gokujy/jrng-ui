# Migrating to 0.0.8

Version 0.0.8 keeps existing component selectors and primary event names. No new mandatory runtime dependency is introduced.

## Angular compatibility

Use Angular 21.2 and RxJS 7.8. Chart.js and Driver.js remain optional peers needed only by chart and tour features.

## Themes

Existing `jrng-ui/styles`, `.j-dark`, and semantic color variables remain supported. New semantic state, elevated-surface, icon-size, and component variables are additive. Runtime configuration now accepts typed global and component token maps.

```ts
provideJrngTheme({
  tokens: { '--j-color-primary': '#4f46e5' },
  components: {
    button: { '--j-button-radius': '0.75rem' },
  },
});
```

## Table and data-grid state

Persisted table state now writes `version: 1`. Older unversioned state is accepted and validated. Invalid JSON, unsupported versions, unknown columns, invalid sort values, and out-of-range pagination values are ignored safely. Applications can observe `stateRestoreError` to report or clear invalid state.

## Editor sanitization

HTML editor values and pasted HTML now use an allowlist. Scripts, inline handlers and styles, executable embeds, SVG, unsafe URL protocols, and data URLs are removed. Applications that previously stored unsupported markup should sanitize existing records and verify the rendered result before upgrading.

## Optional imports

Use public entry points only. The compatibility paths `jrng-ui/image` and `jrng-ui/column-filter` remain available, while their internal circular barrel dependency has been removed.

## Registry metadata

Tooling can read `jrng-ui/registry` and its versioned schema from `jrng-ui/registry/schema`. No CLI executable ships in this release.
