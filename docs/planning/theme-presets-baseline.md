# JRNG UI Theme Presets Baseline

## Current architecture

JRNG UI ships a CSS-variable theme and a small Angular runtime from separate
entrypoints:

- `jrng-ui/theme` exposes the Sass/CSS assets in
  `projects/jrng-ui/src/styles`.
- `jrng-ui/theming` exposes `JThemeService`, `provideJrngTheme`, preset and token
  types, and six primary-colour preset objects.
- `jrng-ui/core` exposes `provideJrngUI`, `JRNG_CONFIG`, and the existing
  `themeMode`, density, input-style, motion, locale, overlay, and z-index
  configuration.

The stylesheet uses the cascade layers `j-theme`, `j-base`, `j-components`, and
`j-utilities`. Primitive tokens are defined by `tokens/_primitive.scss`,
semantic light/dark tokens by `themes/light.scss` and `themes/dark.scss`, and
shared component tokens by `tokens/_component.scss`. Components are standalone
Angular components, with styles split between inline component styles and a
small number of SCSS files.

## Existing public theme API

- `provideJrngUI({ themeMode, density, inputStyle, animation, ... })`
- `provideJrngTheme({ darkClass, preset, tokens, components })`
- `JThemeService.mode`, `isDark`, `setMode`, `toggle`, `applyTokens`,
  `setPreset`, and `getToken`
- `JThemeMode = 'light' | 'dark' | 'system'`
- `JThemePreset`, `JThemeTokens`, `JComponentThemeTokens`, and
  `JThemeTokenName`
- Primary-colour presets `indigoPreset`, `violetPreset`, `emeraldPreset`,
  `rosePreset`, `amberPreset`, and `skyPreset`, plus `jThemePresets`

The existing `JThemePreset.name` is an unrestricted string and options accept a
preset object, not a registered identifier. The `jrng-ui/theme` TypeScript
entrypoint exports nothing; consumers import runtime APIs from
`jrng-ui/theming`.

## Existing tokens

The public CSS contract uses the `--j-*` prefix. Existing primitive groups are:

- Colours: `white`, `black`, Slate 50–950, Blue 50/100/500/600/700, Indigo
  50/500/600/700, Emerald 50/500/600, Amber 50/500/600, Red 50/500/600, and Sky
  50/500/600.
- Spacing: numeric `0`, `1`, `2`, `3`, `4`, `5`, `6`, `8`, `10`, `12`, `16`
  and aliases `2xs` through `5xl`.
- Density: compact, comfortable, and spacious gap/padding plus resolved
  `--j-density-gap` and `--j-density-padding`.
- Radius: `none`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, and `full`.
- Shadow/elevation: `none`, `xs`, `sm`, `md`, `lg`, `inner`, and elevations
  0–4.
- Typography: font family; sizes `xs` through `2xl`; tight, normal, and relaxed
  line heights; normal, medium, semibold, and bold weights.
- Motion: instant, fast, normal, and slow durations; standard and emphasized
  easing; colour, shadow, and transform transitions.
- Icon sizes, z-index levels, and responsive breakpoints.

Existing semantic names include:

- `--j-color-background`, `foreground`, `muted`, `muted-foreground`, `card`,
  `card-foreground`, `popover`, `popover-foreground`, `border`, `input`, and
  `ring`.
- Primary, secondary, success, warning, danger, info, neutral, and contrast
  families with soft and foreground variants where defined.
- `surface`, `surface-elevated`, `surface-muted`, `surface-subtle`, `page`,
  `border-strong`, `text`, `text-muted`, `text-soft`, `hover-background`,
  `selected-background`, `disabled-background`, `disabled-text`, `on-primary`,
  and `on-danger`.
- `--j-focus-ring`, `--j-shadow-focus`, and `--j-disabled-opacity`.

Existing shared component names cover component/control sizing; buttons; inputs;
cards; dialogs and backdrops; tables; selects; tabs; menus; toasts; tooltips;
drawers; editors; tours; skeletons; surface variants; loading; ripple; and diff
highlights. The authoritative full list is the declarations in
`tokens/_component.scss`; those names must be retained or aliased during
migration.

Legacy partials `_colors.scss`, `_spacing.scss`, `_radius.scss`,
`_shadow.scss`, `_typography.scss`, `_transition.scss`, and `_z-index.scss`
also expose Sass variables and some older CSS aliases. These require
compatibility review before removal.

## Existing light/dark behaviour

Light is applied to `:root` and `.j-theme`. Dark variables apply beneath
`.j-dark`, `.j-theme-dark`, or `[data-j-theme='dark']`. `provideJrngUI` only
toggles `.j-dark` for an explicit `dark` mode. `JThemeService` resolves
`system` with `matchMedia('(prefers-color-scheme: dark)')`, listens for
changes, and toggles a configurable dark class on the document element.

Every semantic scheme supplies core surfaces, text, borders, state colours,
focus, disabled colours, and shadows. There is no preset attribute or stable
official preset identifier today.

## Existing runtime switching

`JThemeService.setPreset` serializes the preset object into one managed
`style#j-theme-preset`. Light declarations target `:root`; dark declarations
target the configured dark class. Component groups are flattened into the light
declarations only. `applyTokens` writes inline variables to the document root,
and those values are not tracked for reset or cleanup.

Limitations:

- There is one global style element and no scoped target API.
- Unknown preset identifiers cannot be handled because identifiers are not
  accepted.
- Runtime overrides can outlive later preset changes because inline styles win.
- Component overrides are not scheme-specific and are only a type grouping.
- There is no reset, registry service, deterministic server serialization,
  initial-theme script, or duplicate-scope lifecycle.
- Core and theming initializers both manage `.j-dark`.

## Existing documentation support

`docs/theme-system.md` documents CSS imports, layers, token groups, `.j-dark`,
manual overrides, scoped CSS overrides, and accessibility defaults.
`docs/architecture/theme-token-architecture.md` contains a short design
statement. The docs application has a theming page and dark component previews,
but no official three-preset gallery or runtime preset configurator. Existing
examples describe primary-colour presets rather than full visual presets.

## Hard-coded values found

A repository scan of library and docs TypeScript, HTML, SCSS, and CSS found 699
hex literals across 58 files and 99 RGB/HSL occurrences. Many are intentional
primitive or scheme definitions, documentation swatches, chart/demo data, or
fallback values. Component styles still contain substantial fallback colours,
including Accordion, Date Picker, Input, Tabs, Paginator, Label, Tour, and
several enterprise components.

Examples requiring migration review include:

- Accordion surface, border, text, hover, and primary fallbacks.
- Date Picker overlay shadow and multiple state fallbacks.
- Input focus shadows with literal RGB fallbacks.
- Repeated focus-ring fallbacks in Accordion, Copy Button, Tabs, Paginator, and
  Label.
- Tour backdrop, popover, button, text, border, shadow, and focus fallbacks in
  the global stylesheet.
- Component-specific shadows such as calendar inset selection and input-group
  invalid focus.
- `--j-highlight-background`, backdrop, tour overlay, and skeleton shimmer use
  literal colour values inside the current component-token layer.

Hard-coded `0`, `50%`, and full-rounding values are often geometrically
intentional and should not be mechanically tokenized. Spacing and radius
fallbacks must be classified by semantics before migration rather than removed
blindly.

## Backward-compatibility risks

- Existing applications may import the six colour preset constants or pass
  custom `JThemePreset` objects.
- Existing applications may rely on `.j-theme-dark` or
  `[data-j-theme='dark']`, not only `.j-dark`.
- CSS overrides depend on the current semantic and component token names and on
  inline override precedence.
- `themeMode` currently belongs to `provideJrngUI`; moving it exclusively would
  break configuration.
- `JThemePreset.name` and the current component-name union are public.
- Direct Sass partial consumers may rely on legacy variables.
- Changing control sizes globally can affect layouts and screenshot tests.

The migration should add the official identifier API while continuing to accept
legacy preset objects and aliases. Existing CSS variables and dark selectors
should remain through a documented deprecation window.

## SSR risks

Browser access in both providers is guarded with `isPlatformBrowser`, so current
server execution avoids direct DOM and `matchMedia` access. However, SSR emits
no preset variables or resolved theme attributes, making an initial flash
likely. The `system` result is necessarily unknown on the server unless the
application supplies a request-derived hint. Runtime style injection cannot
contribute to server HTML, and custom root inline tokens are not deterministic
SSR output.

## Zoneless considerations

The runtime uses Angular signals and an effect, so mode changes explicitly
propagate without relying on Zone.js. Media-query listeners update a signal.
Future preset, palette, scope, and override state should remain signal-based,
and DOM writes should be deterministic effects or explicit synchronous
operations. Event listeners and managed scopes must be removed through
`DestroyRef`.

## Recommended migration approach

1. Keep `jrng-ui/theming` and extend its types rather than replacing the
   entrypoint.
2. Add a registry and resolver with stable `default`, `material`, and `nexus`
   identifiers while retaining custom preset objects.
3. Model primitive, semantic, and component layers explicitly and generate
   stable `--j-*` declarations.
4. Apply preset/scheme attributes and variables to either the document root or
   an explicit scoped element, with reference-safe managed styles.
5. Preserve existing semantic/component variable names as canonical names or
   aliases.
6. Make Default reproduce and refine the current JRNG identity before adding
   distinct Material and Nexus values.
7. Migrate component literals by category, retaining only documented
   non-theme geometry and safe fallbacks.
8. Add SSR initialization metadata and a documented nonce-capable flash
   prevention snippet without requiring a runtime dependency.
9. Validate every phase with focused tests, build, lint, docs, registry, SSR,
   and package checks.

## Out-of-scope template settings

Sidebar structure, dashboard layout, menu modes, topbar/footer configuration,
mobile navigation, profile configuration, business configurators, and
preference persistence remain application/template responsibilities. A docs
preview may switch themes locally, but JRNG presets will not own application
layout or storage policy.

## Baseline validation

Run on 2026-07-28 before implementation:

- `npm run build:lib`: passed; 122 components and all modular entrypoints built.
- `npx ng test jrng-ui --watch=false --include='projects/jrng-ui/theming/**/*.spec.ts'`:
  passed, 2 files and 6 tests.
- `npm run test:lib`: passed. jsdom emitted existing non-fatal CSS parse and
  navigation notices.
- `npm run lint`: passed.
- `npm run build:docs:app`: passed; 18 routes built and 122 component API
  examples validated.
- `npm run pack:dry-run`: passed; 272 files, 484.7 kB packed and 3.3 MB
  unpacked.

No baseline command failed. The npm configuration warning for
`min-release-age` and jsdom CSS/navigation notices are pre-existing environment
noise, not failures introduced by theme preset work.
