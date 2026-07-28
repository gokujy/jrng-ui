# Default theme preset

Default is JRNG UI's original primary visual preset. It is modern, clean,
balanced, friendly, and professional, with comfortable density for public sites
and business applications. It is not derived from or named after another
library's preset.

## Setup and switching

```ts
import { ApplicationConfig } from '@angular/core';
import { provideJrngTheme } from 'jrng-ui/theming';

export const appConfig: ApplicationConfig = {
  providers: [
    provideJrngTheme({
      preset: 'default',
      colorScheme: 'system',
    }),
  ],
};
```

```ts
import { inject } from '@angular/core';
import { JThemeService } from 'jrng-ui/theming';

const theme = inject(JThemeService);
theme.setPreset('default');
theme.setColorScheme('dark');
```

## Light mode

The light scheme uses a cool near-white page, clear white cards and overlays,
quiet blue-grey borders, deep readable text, and JRNG indigo for primary
actions. Success, information, warning, and danger each include foreground and
soft-surface semantics.

## Dark mode

The dark scheme uses layered navy surfaces rather than pure black. Elevated
surfaces remain distinguishable, borders stay visible, text maintains a calm
hierarchy, and state colours are tuned separately for dark backgrounds.

## Primary colours and surfaces

Components use `--j-color-primary`, its hover/active/soft/foreground
relationships, and semantic surface variables. They do not read primitive
palette steps directly. Phase 5 documents supported primary and surface palette
customization.

## Typography, radius, spacing, and density

Default uses the JRNG system-font stack, a 0.875rem control text baseline,
comfortable 2.5rem controls, medium radii, balanced panel padding, and readable
table rows. It is more spacious than Nexus and less geometrically strict than
Material.

## Shadows and motion

Four subtle elevation levels separate cards, menus, dialogs, drawers, and
tooltips. Fast 120ms, standard 180ms, and slow 260ms durations use JRNG-owned
easing. Reduced-motion preferences disable non-essential animation in the
shared stylesheet.

## Forms and buttons

Button, input, select, checkbox, radio, switch, and date controls inherit the
same control heights, border semantics, disabled appearance, invalid/valid
colours, and visible focus ring. Read-only fields keep text contrast without
appearing interactive.

## Data components

Tables and Tree Tables use semantic header, row hover, selection, border, text,
loading, and empty-state values. Default table density remains comfortable for
general business use.

## Overlays and feedback

Dialogs, drawers, menus, date overlays, toasts, and tooltips use elevated
surfaces and managed shadows. Progress and skeleton components use semantic
track/value and shimmer tokens.

## Token overrides

```ts
provideJrngTheme({
  preset: 'default',
  tokens: {
    '--j-color-primary': '#087f5b',
    '--j-color-primary-hover': '#066649',
    '--j-color-ring': 'rgb(8 127 91 / 30%)',
  },
  components: {
    card: {
      '--j-card-radius': '1rem',
      '--j-card-shadow': 'var(--j-shadow-md)',
    },
  },
});
```

Application overrides win over the preset. Call `theme.reset()` to return to
provider defaults. Scoped previews can use `theme.createScope(container, {
preset: 'default', colorScheme: 'dark' })`.

## Accessibility states

Default includes focus-visible rings, clear disabled and read-only treatments,
forced-colour focus outlines, reduced-motion handling, logical properties for
RTL, and separate light/dark state colours. Interactive size is controlled by
component tokens so applications can customize density without bypassing the
semantic contract.
