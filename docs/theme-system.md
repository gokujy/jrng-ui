# JRNG UI Themes

JRNG UI provides three original, runtime-switchable visual presets built on one
layered token contract. The theme system owns visual tokens and theme
application; application layout and preference persistence remain application
responsibilities.

## Installation

Import the public theming entrypoint and include the JRNG stylesheet once:

```scss
@use 'jrng-ui/theme';
```

Plain CSS applications can include
`node_modules/jrng-ui/theme/jrng-ui.css`.

## Theme provider setup

```ts
import { ApplicationConfig } from '@angular/core';
import { provideJrngTheme } from 'jrng-ui/theming';

export const appConfig: ApplicationConfig = {
  providers: [
    provideJrngTheme({
      preset: 'default',
      colorScheme: 'system',
      primary: 'indigo',
      surface: 'cool',
    }),
  ],
};
```

`provideJrngTheme()` eagerly starts the SSR-safe, signal-based theme service.
Use `provideJrngUI()` separately for non-theme library configuration.

## Available presets

- **Default** (`default`) is JRNG's modern, balanced, friendly visual identity
  for general websites and business applications.
- **Material** (`material`) is an original JRNG preset inspired by Material
  Design principles. It is not Angular Material and does not require Angular
  Material.
- **Nexus** (`nexus`) is JRNG's enterprise-oriented preset for ERP, CRM,
  dashboards, admin panels, and data-heavy applications.

Each preset includes complete light and dark values for colour, typography,
spacing, radius, density, elevation, focus, motion, feedback, forms, overlays,
navigation, and data components.

## Colour schemes

`colorScheme` accepts:

- `light`: always resolve the light token set.
- `dark`: always resolve the dark token set.
- `system`: follow `prefers-color-scheme` and react to changes.

The active request is exposed through `JThemeService.colorScheme`; the resolved
state is exposed through `isDark`.

## Runtime switching

```ts
const theme = inject(JThemeService);

theme.setPreset('nexus');
theme.setColorScheme('dark');
theme.setPrimaryPalette('emerald');
theme.setSurfacePalette('neutral');
```

All changes update CSS custom properties without reloading the application.
`setMode()` remains as a compatibility alias for `setColorScheme()`.

## Primary colours

Built-in primary palettes are `blue`, `indigo`, `violet`, `emerald`, `teal`,
`orange`, and `rose`. A partial custom scale is also accepted:

```ts
provideJrngTheme({
  primary: {
    400: '#56b7aa',
    500: '#2b998d',
    600: '#197a71',
    700: '#155f59',
  },
});
```

Missing custom steps fall back deterministically. The resolver derives primary
hover, active, contrast, subtle, selection, highlight, and focus-ring semantic
tokens from the completed scale.

## Surface palettes

Built-in surface palettes are `cool`, `neutral`, and `warm`. Custom surface
palettes may independently define light and dark `ground`, `section`, `card`,
`overlay`, `border`, `borderStrong`, `muted`, `hover`, and `selected` values.

```ts
provideJrngTheme({
  surface: {
    light: { ground: '#f7f8fa', card: '#ffffff', border: '#dfe3e8' },
    dark: { ground: '#101216', card: '#181b20', border: '#343940' },
  },
});
```

## Semantic tokens

Semantic tokens describe intent. Components should use them instead of primitive
palette steps. Important groups include:

- primary, primary contrast, and secondary;
- ground, section, card, overlay, borders, hover, and selected surfaces;
- primary, secondary, and muted text;
- success, information, warning, danger, selection, highlight, and backdrop;
- focus, disabled, read-only, valid, and invalid states.

Use `theme.applyTokens({ '--j-color-primary': '...' })` for runtime semantic or
foundation overrides.

## Component tokens

Component groups inherit from semantic values and can be overridden without
changing component APIs:

```ts
theme.applyComponentTokens({
  button: {
    '--j-button-radius': '0.375rem',
    '--j-button-height-md': '2.5rem',
  },
  table: {
    '--j-table-cell-padding': '0.625rem 0.75rem',
  },
});
```

Explicit component overrides have priority over preset component defaults.

## Token overrides

Resolution order is:

1. preset primitive tokens;
2. shared preset semantic tokens;
3. active light or dark semantic tokens;
4. preset component tokens;
5. configured palette values;
6. application semantic overrides;
7. application component overrides.

Call `reset()` to restore the exact provider configuration and remove runtime
overrides.

## Scoped themes

Use a scope when a preview, embedded workflow, or feature must have independent
theme settings:

```ts
const scope = theme.createScope(hostElement, {
  preset: 'material',
  colorScheme: 'dark',
  primary: 'teal',
});

scope.update({ preset: 'nexus', colorScheme: 'light' });
scope.reset();
scope.destroy();
```

The handle manages only its own attributes and variables. Always destroy it
with the host lifecycle. Nested CSS custom properties remain naturally RTL-safe.

## SSR configuration

The resolver, registry, provider, and `getInitialState()` do not directly access
browser-only APIs. Browser DOM application is guarded with `isPlatformBrowser`.
The server can resolve a deterministic preset and explicit scheme:

```ts
const state = theme.getInitialState();
// state.preset, state.colorScheme, state.darkClass, state.css
```

For a system scheme, the server uses the configured deterministic base and the
browser resolves the media preference after hydration.

## Preventing initial theme flash

When the server knows the user's application-owned scheme, render
`getInitialState().css` in the document head before application styles and set
the matching root class and data attributes. Do not read local storage inside
the library. If an application stores preferences, it should safely provide
them to SSR and bootstrap.

## RTL

Theme tokens are direction-neutral. JRNG component styles use logical
properties, so `dir="rtl"` changes layout direction without a different preset
or duplicated theme. Applications should continue to use logical margin,
padding, border, and inset properties in overrides.

## Accessibility

Every preset defines visible focus rings, readable disabled states, semantic
feedback colours, selected states, and accessible control geometry. Components
retain keyboard behavior and ARIA contracts when presets switch. Applications
must recheck contrast when supplying custom token values.

## Reduced motion

Motion durations and easing are tokens. JRNG's base styles suppress
non-essential animation and transitions under
`prefers-reduced-motion: reduce`. A preset never overrides the user's reduced
motion request.

## High contrast

JRNG uses `@media (forced-colors: active)` to preserve visible focus and
boundaries with system colours. Avoid replacing focus outlines with
box-shadow-only custom styles.

## Migration guide

The full migration guide is in [`guides/theme-migration.md`](guides/theme-migration.md).
Existing `themeMode`, `setMode()`, legacy preset objects, and documented CSS
token aliases remain supported. New applications should use official preset
identifiers and canonical semantic tokens.

## API

Public imports come from `jrng-ui/theming`:

- `provideJrngTheme(options)`
- `JThemeService`
- `JThemePresetRegistry`
- `JThemePreset`, `JThemePresetId`, `JThemeOptions`, and token contracts
- `defaultPreset`, `materialPreset`, and `nexusPreset`
- `jPrimaryPalettes` and `jSurfacePalettes`
- CSS generation and resolution utilities for advanced integrations

The library theme API does not include sidebar, menu, topbar, footer, mobile
navigation, profile, persistence, or application-layout configuration.

## FAQ

**Does Material require Angular Material?** No. Material is a JRNG-owned preset
inspired by general Material Design principles and adds no Angular Material
dependency.

**Can presets switch without a reload?** Yes. Preset, scheme, palette, semantic,
and component updates are applied at runtime.

**Can one page contain multiple presets?** Yes. Use `createScope()` and destroy
each returned handle when its host is removed.

**Does JRNG store my choice?** No. Persistence policy belongs to the
application.

**Can I ship only one preset?** Official presets are TypeScript objects and
remain individually importable. The base stylesheet is shared; no separate
mandatory runtime dependency is added.

## Changelog

- Added the official Default, Material, and Nexus preset identifiers.
- Added light, dark, and system resolution with runtime and scoped switching.
- Added primary and surface palette customisation.
- Added layered primitive, semantic, and component token contracts.
- Preserved compatibility aliases for established theme modes and CSS tokens.

See the preset-specific visual references in
[`presets/default.md`](presets/default.md),
[`presets/material.md`](presets/material.md), and
[`presets/nexus.md`](presets/nexus.md).
