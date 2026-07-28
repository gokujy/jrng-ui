# JRNG UI Theme Presets Architecture

## Token layers

JRNG themes resolve in three layers:

1. Primitive tokens define JRNG-owned colour scales, typography, spacing,
   radius, density, elevation, focus, and motion scales.
2. Semantic tokens express purpose: primary and state colours, foregrounds,
   surfaces, borders, selection, disabled states, backdrop, and focus.
3. Component tokens map component decisions to semantic tokens. A component
   override is justified only when its behaviour differs from the semantic
   default.

Resolution order is primitive, shared semantic, shared component, scheme
semantic, scheme component, application semantic override, and application
component override. Later layers win. Components consume semantic or component
variables, not primitive palette steps where a semantic exists.

## TypeScript models

- `JThemePresetId` is the official identifier union: `default`, `material`,
  `nexus`.
- `JThemePreset` retains legacy `name`, `light`, `dark`, and `components`, and
  adds `id`, `displayName`, `primitive`, `semantic`, scheme component groups,
  and aliases.
- `JThemePresetSource` accepts a stable identifier or a custom/legacy preset
  object.
- `JResolvedTheme` contains stable flattened light and dark maps.
- `JThemeOptions` selects preset, colour scheme, and optional global/component
  overrides.
- `JThemeScopeOptions` and `JThemeScope` control an explicitly owned container.
- `JThemeInitialState` is deterministic data suitable for SSR serialization.

Component group keys remain open so modular JRNG entrypoints and
application-owned components do not require a central union update.

## Public API direction

The established provider pattern remains:

```ts
provideJrngUI({ themeMode: 'system' }),
provideJrngTheme({ preset: 'default', colorScheme: 'system' }),
```

`provideJrngTheme` eagerly creates `JThemeService`. Applications can call
`setPreset`, `setColorScheme`, `applyTokens`, `applyComponentTokens`, `reset`,
or `createScope`. The legacy `mode`, `setMode`, `toggle`, custom preset objects,
and `provideJrngUI({ themeMode })` remain supported.

## CSS variable naming convention

All public variables begin `--j-`. Primitive colour values use
`--j-color-{palette}-{step}`; general primitives use
`--j-{category}-{step}`. Semantic colours use `--j-color-{purpose}`.
Component values use `--j-{component}-{property}-{state}`. Values are serialized
in lexical order, invalid names are ignored, and empty values are not emitted.

## Preset registration approach

`JThemePresetRegistry` is tree-shakable and provided in root. It always resolves
an unknown identifier to Default. `register` returns a cleanup function and
restores any previous value if a temporary registration is removed. Official
presets register through the library foundation; custom presets may be passed
directly without global registration.

The Phase 1 Default registry entry is deliberately empty. Complete visual
values arrive in Phase 2; Material and Nexus follow in Phases 3 and 4.

## Runtime theme-switching flow

The service resolves the selected preset, merges overrides, resolves the
effective scheme, and synchronously writes managed attributes and variables.
Signals make preset, scheme, override, and OS-preference changes zoneless-safe.
One managed style contains deterministic light/dark declarations for inspection
and SSR parity. Repeated changes reuse it.

The document root receives `data-j-theme-preset`, `data-j-color-scheme`, the
effective `color-scheme`, and the compatible dark class. Components do not need
preset-specific selectors.

## Light/dark/system flow

`light` and `dark` are deterministic. `system` uses
`(prefers-color-scheme: dark)` in the browser and updates a signal when the
preference changes. The server retains the requested `system` value and emits
both declaration sets; an application can provide a request hint or the
documented bootstrap script to select the initial effective scheme.

## Scoped theme approach

`createScope(element, options)` applies a preset and scheme directly to an
owned container. It returns update, reset, and destroy operations. Each scope
tracks only the variables and attributes it owns, preserves unrelated inline
styles, follows system changes, and can differ from the document theme.
Overlays rendered outside that container inherit the document theme unless the
application configures its overlay target inside the scope.

## SSR strategy

All browser APIs are protected by `isPlatformBrowser`. Resolution and
`getInitialState` work without the DOM. Server integrations can serialize the
returned preset, requested scheme, dark class, and stable CSS. No storage API,
window global, or mandatory runtime dependency is used.

## Flash-of-incorrect-theme prevention

The preferred order is:

1. Render the provider-selected preset and both schemes during SSR.
2. Put the requested preset/scheme attributes on the initial root.
3. For `system`, run a small application-owned nonce-compatible bootstrap
   script before stylesheet paint to toggle the documented class.
4. Do not read persistence in the library; the application supplies any saved
   preference before bootstrap.

## Backward compatibility

Existing variables, `.j-dark`, `.j-theme-dark`,
`[data-j-theme='dark']`, primary-colour preset objects, and legacy service
methods remain. Legacy custom preset objects normalize their `name` into a
registry identifier. Alias variables resolve with `var(--j-canonical-name)`.
`themeMode` can continue to come from `provideJrngUI`.

## Deprecation policy

Deprecated public variables and methods remain for at least one documented
minor migration window and produce no runtime warning in production. The
migration guide identifies replacements. Removal requires a major version and
changelog entry. External library preset names will never be introduced as
aliases.

## Component migration strategy

Migrate representative controls, forms, surfaces, overlays, navigation, and
data components first. Classify literals as semantic colour, component
decision, geometry, data visualization, or fallback. Replace the first two with
tokens, preserve intentional geometry, and document rare visualization values.
Then audit all 122 public components automatically for hard-coded colours and
missing theme fallbacks.

## Testing strategy

- Unit-test registry lifecycle, fallback, deterministic resolution, aliases,
  invalid variables, all schemes, switching, overrides, scopes, cleanup,
  duplicate styles, reset, and SSR.
- Test each preset's complete token contract and distinct light/dark values.
- Add component-token/static guards and representative computed-style tests.
- Run library and docs tests, SSR build, lint, public API/registry checks,
  package verification, and dry pack.
- Cover RTL, forced colours, reduced motion, keyboard focus, disabled states,
  target sizes, and contrast with static and browser checks where available.

## Documentation strategy

The theming guide is the canonical API reference. It will include provider,
runtime, scoped, SSR, accessibility, override, and reset examples. Each preset
gets matching light/dark previews across representative component categories.
A docs-only configurator owns no persistence and does not expose layout
settings.

## Bundle strategy

The resolver and service use Angular plus platform APIs already required by
JRNG. No theme runtime dependency is added. Official presets are exported as
individual constants for tree shaking and through a small registry for the
convenient identifier API. CSS variables avoid per-component preset CSS.
Separate preset entrypoints may be added only if measured output shows a
material benefit without fragile build configuration.

## Definition of done

- Default, Material, and Nexus have complete original light/dark token sets.
- Stable identifiers resolve at provider and runtime boundaries.
- Primary/surface palettes, semantic/component overrides, reset, scope, SSR,
  system mode, RTL, reduced motion, forced colours, and visible focus work.
- Public components use the semantic contract without preset classes.
- Legacy supported setup builds and documented aliases are tested.
- Documentation previews match public code.
- Full release validation and package audit pass or clearly distinguish
  pre-existing/environment failures.
- No application layout or persistence responsibilities enter the theme API.
- Every phase has its own reviewed conventional commit and no remote is pushed.
