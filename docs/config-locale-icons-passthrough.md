# Config, Locale, Icons, And Pass-Through

JRNG UI exposes framework-independent foundation APIs that applications can wire
once at bootstrap.

## Global Config

Use `provideJrngUI(config)` in the application config:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideJrngUI } from 'jrng-ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideJrngUI({
      themeMode: 'system',
      inputStyle: 'outlined',
      ripple: true,
      locale: 'en',
      appendTo: 'body',
      animation: 'enabled',
      density: 'comfortable',
      zIndex: {
        overlay: 1040,
        modal: 1060,
        toast: 1100,
      },
    }),
  ],
};
```

The config is available through `JRNG_CONFIG`.

```ts
import { inject } from '@angular/core';
import { JRNG_CONFIG } from 'jrng-ui';

const config = inject(JRNG_CONFIG);
```

Supported options:

- `themeMode`: `light | dark | system`
- `inputStyle`: `outlined | filled`
- `ripple`: `boolean`
- `locale`: `string`
- `zIndex`: overlay stacking values
- `appendTo`: `self | body | string`
- `animation`: `enabled | disabled`
- `density`: `comfortable | compact | spacious`

## Locale

Use `provideJrngLocale(locale)` to customize shared UI labels:

```ts
import { provideJrngLocale } from 'jrng-ui';

provideJrngLocale({
  accept: 'Accept',
  reject: 'Reject',
  cancel: 'Cancel',
  close: 'Close',
  clear: 'Clear',
  today: 'Today',
  choose: 'Choose',
  upload: 'Upload',
  remove: 'Remove',
  emptyMessage: 'No records found.',
  noResultsFound: 'No results found.',
  selectAll: 'Select all',
  unselectAll: 'Unselect all',
  rowsPerPage: 'Rows per page',
  nextPage: 'Next page',
  previousPage: 'Previous page',
  firstPage: 'First page',
  lastPage: 'Last page',
  search: 'Search',
  loading: 'Loading',
});
```

The locale is available through `JRNG_LOCALE`.

## Icons

JRNG UI includes internal default icon names:

- `check`
- `close`
- `chevron-down`
- `chevron-up`
- `chevron-left`
- `chevron-right`
- `search`
- `calendar`
- `clock`
- `upload`
- `download`
- `plus`
- `minus`
- `info`
- `warning`
- `error`
- `success`
- `loading`
- `sort`
- `filter`
- `more-horizontal`
- `more-vertical`

Register extra icons at bootstrap:

```ts
import { provideJrngIcons } from 'jrng-ui';

provideJrngIcons({
  product: 'M4 7h16v10H4z',
  task: 'M9 11l2 2 4-4M5 5h14v14H5z',
});
```

Or register dynamically:

```ts
import { inject } from '@angular/core';
import { JIconRegistry } from 'jrng-ui';

const icons = inject(JIconRegistry);

icons.registerIcon('team', 'M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0');
icons.registerIcons({
  project: 'M3 6h7l2 2h9v10H3z',
});

const projectIcon = icons.getIcon('project');
```

Icon values are SVG path data used by `j-icon`.

## Pass-Through

`JPassThrough` lets consumers pass classes and safe attributes to internal parts
without forcing a component-specific API for every DOM node.

```ts
import { JPassThrough } from 'jrng-ui';

const pt: JPassThrough = {
  root: { class: 'custom-root' },
  input: { class: 'custom-input', 'data-testid': 'email-input' },
  panel: { class: 'custom-panel' },
};
```

Shared helpers:

- `jMergePartClasses(componentClasses, styleClass, pt, part)`
- `jMergePartAttrs(pt, part, attrs)`
- `jResolvePassThrough(pt, part, componentClasses, styleClass, attrs)`

Only `id`, `role`, `title`, `aria-*`, and `data-*` attributes are forwarded by
the merge helpers. Classes are merged from component classes, `styleClass`, and
pass-through classes.
