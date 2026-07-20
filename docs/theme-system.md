# JRNG UI Theme System

`provideJrngUI()` immutably merges partial configuration with library defaults. Component inputs override global values. Version 0.1.0 applies `themeMode`, `inputStyle`, `ripple`, `locale`, `zIndex`, `appendTo`, `animation`, and `density` through configuration tokens and document-level behavior hooks. Reduced-motion preferences suppress non-essential ripple and motion.

```ts
provideJrngUI({
  themeMode: 'system',
  inputStyle: 'filled',
  ripple: false,
  locale: 'de-DE',
  appendTo: 'body',
  animation: 'enabled',
  density: 'compact',
});
```

Use `provideJrngLocale(jLocales['hi'])` or `provideJrngLocale(jLocales['gu'])` as tree-shakable Hindi and Gujarati examples; partial locales merge over the complete English locale.

JRNG UI is a generic, premium Angular UI component library. Its visual language
is defined with original CSS variables and layered CSS, independent of any UI
framework.

Import the theme once in the application global stylesheet:

```scss
@use 'jrng-ui/theme';
```

If a Sass resolver does not read the package `sass` export, import the copied
asset directly:

```scss
@use 'jrng-ui/theme/jrng-ui';
```

Plain CSS builds can include:

```json
{
  "styles": ["node_modules/jrng-ui/theme/jrng-ui.css", "src/styles.css"]
}
```

## CSS Layers

The theme declares predictable cascade layers:

```scss
@layer j-theme, j-base, j-components, j-utilities;
```

- `j-theme`: design tokens and theme values.
- `j-base`: base `.j-*` surfaces, focus behavior, reduced motion support, and high contrast focus handling.
- `j-components`: reserved for shared component-level styling.
- `j-utilities`: small `.j-*` helpers such as `.j-sr-only`, `.j-disabled`, and `.j-ripple`.

Do not add generic utility classes such as `.flex`, `.grid`, `.card`, or `.button`.

## Token Layers

Theme source lives in `projects/jrng-ui/src/styles`.

Primitive tokens:

- `tokens/_primitive.scss`
- Examples: `--j-color-slate-50`, `--j-color-slate-900`, `--j-color-blue-500`, `--j-radius-md`, `--j-spacing-2`, `--j-shadow-sm`.

Semantic tokens:

- `themes/light.scss`
- `themes/dark.scss`
- Examples: `--j-color-background`, `--j-color-foreground`, `--j-color-muted`, `--j-color-card`, `--j-color-popover`, `--j-color-border`, `--j-color-ring`, `--j-color-primary`, `--j-color-danger`.

Component tokens:

- `tokens/_component.scss`
- Examples: `--j-button-height-md`, `--j-button-radius`, `--j-button-primary-bg`, `--j-input-height-md`, `--j-card-radius`, `--j-dialog-shadow`, `--j-table-header-bg`.

The global entry file is `jrng-ui.scss`.

## Light And Dark

Light theme is the default on `:root` and `.j-theme`.

Dark theme is enabled with `.j-dark` on the application root:

```html
<app-root class="j-dark"></app-root>
```

## Overriding Tokens

Override semantic tokens after importing the theme:

```scss
@use 'jrng-ui/theme';

:root {
  --j-color-primary: #0f766e;
  --j-color-primary-hover: #0f5f59;
  --j-color-ring: rgb(15 118 110 / 28%);
  --j-radius-md: 0.5rem;
}
```

Tokens can be scoped to a feature shell:

```scss
.feature-module {
  --j-color-primary: #7c3aed;
  --j-color-card: #ffffff;
  --j-card-radius: 0.75rem;
}
```

## Component Tokens

Prefer component tokens when changing the look of a specific component family:

```scss
:root {
  --j-button-radius: 0.625rem;
  --j-button-height-md: 2.625rem;
  --j-input-border-color: var(--j-color-border);
  --j-card-shadow: var(--j-shadow-md);
  --j-table-header-bg: var(--j-color-muted);
}
```

Use semantic tokens for product-level color and surface decisions. Use primitive
tokens only when defining a new semantic token.

## Accessibility Defaults

The theme includes:

- Calm focus rings through `--j-color-ring` and `--j-focus-ring`.
- High contrast focus support with `@media (forced-colors: active)`.
- Reduced motion support with `@media (prefers-reduced-motion: reduce)`.
- Disabled opacity through `--j-disabled-opacity`.

## Original CSS Rule

JRNG UI styling must be original. Do not copy source CSS, token names,
documentation, examples, branding, or exact visual design from any external UI
library. Common UI patterns are acceptable, but implementation and styling must
remain JRNG-owned.
