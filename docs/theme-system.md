# JRNG UI Theme System

JRNG UI exposes a CSS-variable theme layer from:

```scss
@use 'jrng-ui/theme';
```

If your Sass resolver does not read the package `sass` export, import the copied
asset directly:

```scss
@use 'jrng-ui/theme/jrng-ui';
```

With an explicit extension:

```scss
@use 'jrng-ui/theme/jrng-ui.scss';
```

For Angular `styles` array usage, include the compiled or bundled app stylesheet
that imports the theme.

## Token Files

Theme source lives in `projects/jrng-ui/src/styles`.

- `_colors.scss`
- `_spacing.scss`
- `_radius.scss`
- `_typography.scss`
- `_shadow.scss`
- `_z-index.scss`
- `_transition.scss`
- `_breakpoints.scss`
- `jrng-ui.scss`

`jrng-ui.scss` is the global entry file. It only emits CSS variables and `.j-*`
base helpers.

## Token Override

Override tokens after importing the theme:

```scss
@use 'jrng-ui/theme';

:root {
  --j-color-primary: #0f766e;
  --j-color-secondary: #2563eb;
  --j-radius-md: 0.375rem;
  --j-spacing-md: 0.875rem;
  --j-focus-ring: 0 0 0 3px rgb(15 118 110 / 24%);
}
```

Tokens can also be scoped to a section:

```scss
.billing-module {
  --j-color-primary: #7c3aed;
  --j-color-surface: #ffffff;
}
```

## Dark Theme

Dark mode is prepared but not forced. Apply either `.j-theme-dark` or
`data-j-theme="dark"` to the application root when the product decides to enable
dark theme switching.

```html
<app-root class="j-theme-dark"></app-root>
```

```html
<app-root data-j-theme="dark"></app-root>
```

The default `:root` and `.j-theme` token set remains light.

## Base Classes

The theme exposes only `.j-*` base helpers:

- `.j-app`
- `.j-surface`
- `.j-focus-ring`
- `.j-disabled`
- `.j-sr-only`

State class `.is-disabled` is also supported for component state styling. No
PrimeNG theme is imported.
