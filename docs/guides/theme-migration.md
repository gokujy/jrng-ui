# JRNG UI Theme Preset Migration

This guide moves an existing JRNG UI application from the original mode and
colour-preset setup to the official Default, Material, and Nexus preset system.
The migration is additive: established configuration, preset objects, and
documented CSS tokens remain available in this release.

## Previous theme setup

Existing applications commonly configured colour mode through `provideJrngUI`
and selected a primary-colour object:

```ts
import { provideJrngUI } from 'jrng-ui/core';
import { jThemePresets, provideJrngTheme } from 'jrng-ui/theming';

providers: [
  provideJrngUI({ themeMode: 'dark' }),
  provideJrngTheme({ preset: jThemePresets.emerald }),
];
```

This continues to build. `themeMode` supplies the scheme when
`provideJrngTheme()` does not specify `colorScheme`, and legacy preset objects
remain accepted.

## New preset setup

Choose a visual preset independently from its primary and surface palettes:

```ts
import { provideJrngUI } from 'jrng-ui/core';
import { provideJrngTheme } from 'jrng-ui/theming';

providers: [
  provideJrngUI(),
  provideJrngTheme({
    preset: 'default',
    colorScheme: 'dark',
    primary: 'emerald',
    surface: 'cool',
  }),
];
```

The official identifiers are `default`, `material`, and `nexus`. Their displayed
names are Default, Material, and Nexus.

## Existing token mapping

The following established tokens are retained. New code should prefer the
canonical semantic token when the row identifies one.

| Existing token               | Canonical relationship           | Compatibility                     |
| ---------------------------- | -------------------------------- | --------------------------------- |
| `--j-color-page`             | `--j-color-background`           | Retained in every official preset |
| `--j-color-text`             | `--j-color-foreground`           | Retained while components migrate |
| `--j-color-text-muted`       | `--j-color-muted-foreground`     | Retained while components migrate |
| `--j-color-surface`          | `--j-color-card`                 | Retained in every official preset |
| `--j-color-surface-muted`    | `--j-color-muted`                | Retained in every official preset |
| `--j-color-surface-elevated` | `--j-color-popover`              | Retained in every official preset |
| `--j-color-on-primary`       | `--j-color-primary-foreground`   | Retained in every official preset |
| `--j-color-on-danger`        | `--j-color-danger-foreground`    | Retained in every official preset |
| `--j-color-focus`            | `--j-color-primary`              | Emitted compatibility alias       |
| `--j-input-color`            | `--j-input-text-color`           | Emitted compatibility alias       |
| `--j-highlight-background`   | `--j-color-highlight-background` | Emitted compatibility alias       |

Component tokens such as `--j-button-primary-bg`, `--j-input-border-color`,
`--j-card-bg`, `--j-dialog-shadow`, and `--j-table-header-bg` retain their
existing names.

## Renamed tokens

No documented token has been removed. Where a clearer canonical semantic name
was introduced, the old name is either assigned by the preset or emitted as a
CSS-variable alias. This allows existing CSS overrides to continue resolving.

Prefer these canonical forms in new overrides:

```css
:root {
  --j-color-background: #f6f8fb;
  --j-color-foreground: #152033;
  --j-color-muted-foreground: #657086;
  --j-input-text-color: var(--j-color-foreground);
  --j-color-highlight-background: #fff0b8;
}
```

## Deprecated APIs

- `JThemeService.mode` is deprecated; use `colorScheme`.
- `JThemeService.setMode()` is deprecated; use `setColorScheme()`.
- `jThemePresets`, `JThemePresetName`, and the exported indigo, violet,
  emerald, rose, amber, and sky preset objects are deprecated colour-preset
  helpers. Use an official preset plus `primary`.
- `J_EMPTY_DEFAULT_PRESET` is deprecated; import `defaultPreset`.

These APIs are not removed in this release. Deprecation notices are emitted in
the TypeScript declarations.

## Light/dark migration

Before:

```ts
theme.setMode('dark');
```

After:

```ts
theme.setColorScheme('dark');
```

`light`, `dark`, and `system` remain the accepted values. The default dark class
remains `.j-dark`, and `setMode()` remains a functional alias.

## Runtime switching migration

Before:

```ts
theme.setPreset(jThemePresets.violet);
theme.setMode('light');
```

After:

```ts
theme.setPreset('material');
theme.setPrimaryPalette('violet');
theme.setColorScheme('light');
```

Use `setSurfacePalette()`, `applyTokens()`, and
`applyComponentTokens()` for further runtime changes. Call `reset()` to return
to provider defaults.

## Custom colour migration

A legacy custom `JThemePreset` object still works. For primary-only changes,
move its scale into `primary` so the resolver can update related interaction,
contrast, selection, and focus tokens:

```ts
provideJrngTheme({
  preset: 'default',
  primary: {
    400: '#69b8ab',
    500: '#379b8d',
    600: '#207b70',
    700: '#185f57',
  },
});
```

Use semantic `tokens` when a product colour cannot be expressed as a scale.
Incomplete custom scales fall back predictably to the built-in base scale.

## Custom component-style migration

Move component-family decisions from broad selectors into component tokens:

```ts
provideJrngTheme({
  components: {
    button: {
      '--j-button-radius': '0.375rem',
    },
    table: {
      '--j-table-row-height': '2.5rem',
      '--j-table-cell-padding-y': '0.5rem',
    },
  },
});
```

This keeps overrides compatible with all three presets and scoped themes.

## CSS override migration

Keep the theme stylesheet before application overrides. Prefer semantic custom
properties on `:root` or on a feature container:

```scss
@use 'jrng-ui/theme';

.billing-workspace {
  --j-color-card: #fff;
  --j-color-border: #d9e0e8;
  --j-card-radius: 0.625rem;
}
```

Avoid targeting component internals or adding preset-specific component
selectors. For runtime-scoped configuration, use `createScope()` so cleanup is
automatic.

## Troubleshooting

### The old primary colour no longer affects the whole preset

Use `primary: 'emerald'` or `setPrimaryPalette('emerald')`. The official
`preset` option now selects visual structure, not just a colour.

### The server renders a different initial scheme

Pass an explicit server-known `colorScheme` and serialize
`getInitialState().css` before application styles. A `system` preference cannot
be known by a generic server without an application-provided hint.

### A custom token does not change a component

Inspect whether that component has a more specific component token. Override
the component token through `components`, or update the semantic token it
inherits from.

### A scoped preview leaves styles behind

Keep the `JThemeScope` returned by `createScope()` and call `destroy()` in the
host lifecycle. Only variables and attributes managed by that scope are
removed.

### An old application uses `.j-dark`

No change is required. `.j-dark` remains the default dark selector. A custom
`darkClass` is still supported through `provideJrngTheme()`.

## Unavoidable breaking changes

There are no intentional removals in this release. The semantic meaning of
`preset` is broader for new string identifiers, but legacy preset objects remain
accepted. Applications that previously treated names such as `emerald` as
official visual preset identifiers should migrate to
`preset: 'default', primary: 'emerald'`; object-based usage continues to work
during the deprecation period.

Application persistence, sidebar and menu modes, topbar settings, footer
configuration, and user-profile preferences are intentionally outside the JRNG
theme system.
