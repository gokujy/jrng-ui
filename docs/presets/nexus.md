# Nexus theme preset

> JRNG's enterprise-oriented preset for ERP, CRM, dashboards, admin panels and
> data-heavy applications.

Nexus is compact, structured, efficient, and professional. It reduces
unnecessary vertical space while retaining readable text, visible keyboard
focus, distinct disabled states, and interactive targets of at least 1.5rem
(24px) at the token boundary. It is an original JRNG implementation.

## Setup

```ts
import { provideJrngTheme } from 'jrng-ui/theming';

provideJrngTheme({
  preset: 'nexus',
  colorScheme: 'system',
});
```

## Light and dark

Nexus light uses cool grey work surfaces, crisp separators, and a restrained
blue-teal primary suitable for long sessions. Nexus dark uses layered
blue-charcoal surfaces, clear borders, and independently tuned state and focus
colours. Both schemes provide the complete JRNG semantic contract.

## Compact forms

The default control is 2.25rem tall, with 1.75rem small and 2.625rem large
variants. Horizontal padding and field gaps are reduced without shrinking type
below the readable preset scale. Invalid, valid, read-only, disabled, and focus
states use the same semantic contract as Default and Material.

## Dense tables and CRM lists

Table rows default to 2.25rem, with 0.75rem horizontal cell padding and compact
vertical padding. Header, hover, selection, frozen separators, loading, empty,
status, and editing states remain visually distinct. This supports CRM customer
lists, finance grids, ERP line items, and operations queues without adding a
table-specific preset class.

## Dashboard cards and status indicators

Cards use compact 0.75rem padding, a controlled low shadow, and clear borders.
Chips and tags use a 1.5rem height with semantic success, information, warning,
danger, neutral, and contrast colours.

## Navigation and toolbars

Menu items are 2rem high, tabs are 2.25rem high, and toolbars are 2.5rem high.
Logical spacing supports RTL. These are visual tokens only: Nexus does not
choose a sidebar layout, menu mode, topbar, footer, or mobile navigation model.

## Dialogs and overlays

Dialogs use compact section padding with readable headings and form rhythm.
Menus, select panels, date controls, command palettes, and other overlays use
compact padding, visible separators, controlled elevation, and the shared
backdrop semantic.

## Enterprise component coverage

Nexus provides density hooks for filter toolbars, Kanban cards, Gantt rows,
scheduler rows, File Browser rows, Query Builder rows, form sections, dialogs,
tables, menus, tabs, chips, cards, and panels. These tokens affect appearance
only; component behaviour and application composition remain unchanged.

## Data-heavy page example

```html
<section class="j-app" dir="ltr">
  <j-toolbar><!-- filters and actions --></j-toolbar>
  <j-card>
    <j-table [value]="customers"><!-- columns --></j-table>
  </j-card>
</section>
```

All imports continue to come from modular `jrng-ui/*` entrypoints. The theme
provider is the only preset-specific setup.

## Density customization

```ts
provideJrngTheme({
  preset: 'nexus',
  components: {
    table: {
      '--j-table-row-height': '2.5rem',
      '--j-table-cell-padding-y': '0.375rem',
    },
    control: {
      '--j-control-height-md': '2.5rem',
    },
  },
});
```

## Primary override

```ts
provideJrngTheme({
  preset: 'nexus',
  tokens: {
    '--j-color-primary': '#6d3fc0',
    '--j-color-primary-hover': '#5831a1',
    '--j-color-ring': 'rgb(109 63 192 / 36%)',
  },
});
```

Runtime switching, scoped themes, SSR state, reset, reduced motion,
forced-colour focus, and application-owned persistence behave consistently
across all three presets.
