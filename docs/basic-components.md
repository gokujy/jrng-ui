# Basic Components

Import the theme once:

```scss
@use 'jrng-ui/theme';
```

## Button

```ts
import { JButtonComponent } from 'jrng-ui/button';
```

```html
<j-button label="Save" severity="primary" (clicked)="save()" />
<j-button severity="danger" variant="outlined" icon="!" iconPosition="left">Delete</j-button>
<j-button label="Loading" loading />
```

`j-button` renders a native `button` internally. It emits `clicked` only when it
is not disabled or loading. Native Angular `(click)` bindings can still listen on
the host for enabled clicks.

## Card

```ts
import { JCardComponent } from 'jrng-ui/card';
```

```html
<j-card header="Revenue" subheader="This month">
  <strong>Rs. 42.8L</strong>
  <j-button jCardFooter label="Review" size="sm" />
</j-card>
```

## Badge

```ts
import { JBadgeComponent } from 'jrng-ui/badge';
```

```html
<j-badge value="12" severity="danger" />
<j-badge severity="success">Paid</j-badge>
```

## Tag

```ts
import { JTagComponent } from 'jrng-ui/tag';
```

```html
<j-tag label="Approved" severity="success" />
<j-tag label="GST pending" severity="warning" removable (remove)="removeTag()" />
```

## Avatar

```ts
import { JAvatarComponent } from 'jrng-ui/avatar';
```

```html
<j-avatar label="JR" />
<j-avatar image="/assets/user.jpg" ariaLabel="Jay Rathod" size="lg" />
```

## Divider

```ts
import { JDividerComponent } from 'jrng-ui/divider';
```

```html
<j-divider />
<j-divider layout="vertical" />
```

## Loader

```ts
import { JLoaderComponent } from 'jrng-ui/loader';
```

```html
<j-loader [size]="24" [strokeWidth]="3" label="Loading invoices" />
```

## Progress Spinner

```ts
import { JProgressSpinnerComponent } from 'jrng-ui/progress-spinner';
```

```html
<j-progress-spinner [size]="36" [strokeWidth]="4" label="Syncing records" />
```

## Progress Bar

```ts
import { JProgressBarComponent } from 'jrng-ui/progress-bar';
```

```html
<j-progress-bar [value]="72" label="Upload progress" />
<j-progress-bar indeterminate severity="info" label="Processing" />
```

## Skeleton

```ts
import { JSkeletonComponent } from 'jrng-ui/skeleton';
```

```html
<j-skeleton width="18rem" height="1rem" />
<j-skeleton width="3rem" height="3rem" shape="circle" />
```

## Empty State

```ts
import { JEmptyStateComponent } from 'jrng-ui/empty-state';
```

```html
<j-empty-state title="No invoices found" description="Try changing filters." icon="∅">
  <j-button label="Create invoice" />
</j-empty-state>
```

## Icon

```ts
import { JIconComponent, JIconRegistry } from 'jrng-ui/icon';
```

```html
<j-icon name="check" ariaLabel="Complete" />

<j-icon>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2 2 22h20L12 2Z" />
  </svg>
</j-icon>
```

Built-in icon names include `check`, `close`, `info`, `warning`, `search`, and
`chevron-down`. Applications can register additional SVG paths through
`JIconRegistry`.
