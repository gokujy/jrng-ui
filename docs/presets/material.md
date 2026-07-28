# Material theme preset

> Material is a JRNG preset inspired by Material Design principles. It is not
> Angular Material and does not require Angular Material.

Material keeps every JRNG component API unchanged while applying structured
surfaces, recognisable elevation, deliberate geometry, strong state feedback,
and purposeful motion. Its implementation, CSS variables, colour values, and
component decisions are original to JRNG.

## Setup

```ts
import { ApplicationConfig } from '@angular/core';
import { provideJrngTheme } from 'jrng-ui/theming';

export const appConfig: ApplicationConfig = {
  providers: [
    provideJrngTheme({
      preset: 'material',
      colorScheme: 'system',
    }),
  ],
};
```

No Angular Material package, stylesheet, runtime, component, or compatibility
adapter is required.

## Light and dark

The light scheme combines neutral structured surfaces, crisp separators, and a
deep blue-violet primary. The dark scheme uses charcoal surface steps with
separately tuned primary, state, border, disabled, and focus colours. Both
schemes expose the full JRNG semantic contract.

## Form controls

Forms use clear 2.625rem default controls, tighter radii than Default, stronger
border hierarchy, a visible focus ring, explicit invalid/valid semantics, and
clear read-only and disabled treatments. Labels, inputs, selects, checkboxes,
radios, switches, date controls, and overlay options share these decisions.

## Buttons and interaction

Buttons use medium weight, structured geometry, clear solid/outlined/soft/text
states, and the shared JRNG ripple directive where enabled. Interaction
durations are 100ms, 200ms, and 300ms, with reduced-motion handling from the
base theme.

## Cards, panels, and elevation

Cards use low elevation by default; menus and toasts use middle levels; dialogs
and drawers use the strongest level. Elevation is represented by JRNG
`--j-shadow-*` tokens rather than external framework classes.

## Tables and navigation

Tables use a distinct structured header surface, visible dividers, state-aware
hover/selection, and comfortable row sizing. Menus use 2.625rem items, and tabs
receive a stronger active indicator token. All spacing remains logical for RTL.

## Dialogs, overlays, and feedback

Dialogs use a medium radius, purposeful high elevation, and a stronger backdrop.
Selects, menus, toasts, tooltips, progress, and skeletons inherit the same
surface and motion hierarchy.

## Token overrides

```ts
provideJrngTheme({
  preset: 'material',
  colorScheme: 'dark',
  tokens: {
    '--j-color-primary': '#006c60',
    '--j-color-primary-hover': '#008678',
    '--j-color-ring': 'rgb(0 108 96 / 40%)',
  },
  components: {
    card: {
      '--j-card-shadow': 'var(--j-shadow-md)',
    },
  },
});
```

Overrides follow the same priority, scoped-theme, SSR, reset, accessibility,
and runtime switching rules as every JRNG preset.
