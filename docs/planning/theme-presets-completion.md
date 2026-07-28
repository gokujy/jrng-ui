# JRNG UI Theme Presets Completion

## Presets delivered

JRNG UI now ships three complete original visual presets:

| Display name | Public identifier | Direction                                                                   |
| ------------ | ----------------- | --------------------------------------------------------------------------- |
| Default      | `default`         | Modern, balanced JRNG identity for general applications                     |
| Material     | `material`        | Structured, elevation-led JRNG interpretation of Material Design principles |
| Nexus        | `nexus`           | Compact enterprise treatment for ERP, CRM, admin, and data-heavy work       |

Each preset resolves a complete light and dark contract. `system` mode follows
the browser colour-scheme preference at runtime.

## Public preset identifiers

The stable identifier type is:

```ts
type JThemePresetId = 'default' | 'material' | 'nexus';
```

No external library preset name is part of the official registry, CSS selectors,
or provider API.

## Public API

The modular public entrypoint is `jrng-ui/theming`.

```ts
provideJrngTheme({
  preset: 'default',
  colorScheme: 'system',
  primary: 'indigo',
  surface: 'cool',
  tokens: {
    '--j-color-highlight-background': '#fff2b8',
  },
  components: {
    button: {
      '--j-button-radius': '0.5rem',
    },
  },
});
```

`JThemeService` provides `setPreset()`, `setColorScheme()`,
`setPrimaryPalette()`, `setSurfacePalette()`, `applyTokens()`,
`applyComponentTokens()`, `reset()`, `createScope()`, `getInitialState()`, and
`getToken()`. The service uses Angular signals, explicitly refreshes managed
state for zoneless operation, guards browser-only work, and removes managed
scope state during cleanup.

`JThemePresetRegistry`, resolution helpers, CSS generation helpers, token
contracts, palette contracts, and all official preset objects are public.

## Token architecture

The delivered layers are:

1. **Primitive:** colour scales, font family, font sizes and weights, line
   height, spacing, radius, shadow/elevation, duration, easing, density, and
   control geometry.
2. **Semantic:** primary and contrast, secondary, ground, card, overlay,
   borders, text hierarchy, focus, disabled/read-only, feedback, selection,
   highlight, and backdrop.
3. **Component:** controls, buttons, inputs, selects, cards, dialogs, tables,
   navigation, tabs, overlays, feedback, progress, skeleton, and enterprise
   density hooks.

Component values inherit semantic values unless a preset deliberately changes
geometry, density, elevation, or interaction treatment. Application semantic
and component overrides have final priority.

## Components migrated

The semantic migration directly updated shared theme styles and component
sources for accordion, app shell, avatar group, badge, breadcrumb, button, card,
checkbox, confirm dialog, copy button, date picker, dialog, drawer, empty state,
fieldset, file preview, file upload, filter bar, highlight, image, input, label,
loader, menu, overlay header, page header, paginator, panel, progress bar,
responsive sidebar, select, skeleton, splitter, status chip, stepper, table,
tabs, time picker, toolbar, and tour, plus the barcode, cron-expression, and
query-builder entrypoints.

The final automated source audit covers 338 non-test component source files
across the 122-component public registry. It rejects new preset-specific
component selectors and unapproved hard-coded presentation colours. Functional
colour values remain intentionally allowed only for barcode output, chart
fallback data, the colour-picker value model, and a loader mask.

## Backward-compatible aliases

The previous `provideJrngUI({ themeMode })` value remains the scheme fallback.
Legacy `JThemePreset` objects and the original colour-preset objects remain
accepted by provider and runtime APIs.

The official presets retain established semantic names including
`--j-color-page`, `--j-color-text`, `--j-color-text-muted`,
`--j-color-surface`, `--j-color-surface-muted`,
`--j-color-surface-elevated`, `--j-color-on-primary`, and
`--j-color-on-danger`.

They also emit these explicit aliases:

- `--j-color-focus` to `--j-color-primary`
- `--j-input-color` to `--j-input-text-color`
- `--j-highlight-background` to `--j-color-highlight-background`

## Deprecated tokens and APIs

No documented CSS token was removed. The following TypeScript APIs are
deprecated but functional:

- `JThemeService.mode`; use `colorScheme`.
- `JThemeService.setMode()`; use `setColorScheme()`.
- `jThemePresets`, `JThemePresetName`, and the legacy indigo, violet, emerald,
  rose, amber, and sky colour-preset objects; use an official preset plus
  `primary`.
- `J_EMPTY_DEFAULT_PRESET`; use `defaultPreset`.

## Documentation pages

- `docs/theme-system.md`
- `docs/theme-palettes.md`
- `docs/presets/default.md`
- `docs/presets/material.md`
- `docs/presets/nexus.md`
- `docs/guides/theme-migration.md`
- `docs/planning/theme-presets-baseline.md`
- `docs/planning/theme-presets-architecture.md`
- `/themes` in the documentation application

The `/themes` page uses a documentation-only scoped preview for preset, scheme,
primary, surface, and reset. It does not use local storage and does not change
unrelated documentation previews.

## Tests executed

The final validation matrix on 2026-07-28 included:

- `npm run build:clean`
- `node scripts/run-angular-cli.mjs test --watch=false`
- `ng test jrng-ui --watch=false --include="projects/jrng-ui/theming/**/*.spec.ts"`
- `npm run lint`
- `npm run typecheck`
- `npm run docs:audit`
- `npm run verify:docs-links`
- `ng build ssr-smoke`
- `node scripts/verify-public-api.mjs`
- `node scripts/verify-public-registry.mjs`
- `node scripts/verify-spec-coverage.mjs`
- `node scripts/verify-consumer.mjs`
- `node scripts/verify-package.mjs --skip-build --report`
- `npm run verify:theme`

The final full tests passed 190 library files with 789 tests and 8 documentation
files with 31 tests. The focused theme suite passed 9 files with 43 tests. No
test failed after the release fixes.

## SSR result

Passed. The SSR smoke build prerendered its static route. Theme resolution and
`getInitialState()` are deterministic on the server, direct DOM work is guarded,
and explicit scheme/preset state can be serialized before application styles.

## RTL result

Passed source and behavior guards. Components use logical properties, scoped
switching preserves `dir="rtl"`, and preset data contains no direction-specific
layout configuration.

## Accessibility result

Automated component tests and the theme matrix passed for keyboard/disabled
contracts, visible focus tokens, Nexus target sizing, reduced-motion rules, and
forced-colour rules. All presets resolve focus, disabled, feedback, and
selection semantics in both schemes.

Browser screenshot regression and automated perceptual contrast measurement are
not configured in this repository; these remain recommended follow-up release
checks for future palette additions.

## Bundle impact

- New mandatory dependencies: none.
- New optional dependencies: none.
- Package: 272 files, 494,663 bytes packed, 3,358,341 bytes unpacked.
- Baseline package: 484.7 kB packed and 3.3 MB unpacked.
- Approximate packed increase: 10 kB, or 2.1%.
- `jrng-ui/theming` FESM: 56,622 bytes unpacked.
- Shared `jrng-ui.css`: 22,893 bytes.
- Package `sideEffects` remains `false`, and the theme API remains a modular
  secondary entrypoint.
- The three small official preset objects are registered together when the
  runtime theme service is used. Separate per-preset package entrypoints are not
  currently provided; this is a known bundle-granularity limitation.
- Token maps are normalized to one stable value per CSS variable in resolved
  output. Light and dark resolved contracts have matching key sets.

The package budget was raised narrowly to 500,000 packed bytes and 3,370,000
unpacked bytes to account for the measured complete theming entrypoint. The
per-file 310,000-byte guard remains unchanged.

## Known limitations

- Visual screenshot baselines are not part of the current test harness.
- Automated contrast ratios are not computed by repository tooling.
- Official presets share one runtime entrypoint instead of separate
  per-preset entrypoints.
- Application-owned preference persistence must be implemented by consumers.

## Deferred improvements

- Add browser-based screenshot coverage for all public components across the
  six preset/scheme combinations.
- Add automated contrast reporting for custom palette inputs.
- Evaluate optional per-preset secondary entrypoints only if real consumer
  bundle measurements justify the extra package surface.

## Phase commit hashes

| Phase | Commit                                     | Message                                       |
| ----- | ------------------------------------------ | --------------------------------------------- |
| 0     | `2c52f2a64f1b44123d90750c18b3eaa825bfdaac` | `docs(theme): record preset system baseline`  |
| 1     | `f0dc8f85d1f89a765cdc33edbc8af341ecbcaab3` | `feat(theme): add preset architecture`        |
| 2     | `985912eb7bf396fc4d64be78f04be11b92e7b817` | `feat(theme): add default preset`             |
| 3     | `7964adbc866978640753bba1b4418e3b5bfdea54` | `feat(theme): add material preset`            |
| 4     | `10385581783ffe10c3d3b68edd3b8c036d3c5be7` | `feat(theme): add nexus enterprise preset`    |
| 5     | `522561195f8f7f75a6245db3c768fc240cb08e0d` | `feat(theme): add palette customisation`      |
| 6     | `3799c5a2e85fe441a98bcc234be70995dcf70249` | `docs(theme): add preset guides and previews` |
| 7     | `84dfec4ee23bd6f7b6f5adafc8ae607755f7fdea` | `docs(theme): add preset migration guide`     |
| 8     | The commit containing this document        | `chore(theme): finalize preset system`        |

The Phase 8 hash is recorded in the final task report after Git creates the
commit; a commit cannot contain its own content-addressed hash.

## Originality and responsibility confirmations

The presets, token values, CSS, services, and documentation were authored for
JRNG UI. No reference implementation, CSS, private token vocabulary, or source
values were copied.

Application layout settings remain outside the theme system. No sidebar type,
menu mode, topbar, footer, mobile-navigation, profile, persistence, local
storage, or database policy was added to preset configuration.

No remote push was performed.
