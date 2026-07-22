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
<j-button label="Save" severity="primary" (onClick)="save()" />
<j-button label="Archive" severity="neutral" variant="soft" />
<j-button label="Delete" severity="danger" variant="outline" />
<j-button label="Open details" variant="link" />
<j-button label="Loading" loading />
<j-button icon="+" iconOnly ariaLabel="Add item" rounded />
<j-button label="Continue" size="xl" fullWidth />
```

`j-button` renders a native `button` internally. It emits `onClick` only when it
is not disabled or loading. Native Angular `(click)` bindings can still listen on
the host for enabled clicks. Supported severities are `primary`, `secondary`,
`neutral`, `success`, `warning`, `danger`, and `info`. Supported visual variants
are `filled`, `outline`, `ghost`, `soft`, and `link`.

## Card

```ts
import { JCardComponent } from 'jrng-ui/card';
```

```html
<j-card header="Orders" subheader="This month" elevated>
  <strong>42.8k</strong>
  <div jCardActions>
    <j-button label="Review" size="sm" />
  </div>
</j-card>

<j-card header="Project" subheader="Updated today" bordered interactive compact>
  <p>Project activity and summary content.</p>
</j-card>

<j-card skeleton />
```

Cards support projected `[jCardHeader]`, `[jCardBody]`, `[jCardFooter]`, and
`[jCardActions]` sections.

## Badge

```ts
import { JBadgeComponent } from 'jrng-ui/badge';
```

```html
<j-badge [value]="148" [max]="99" severity="danger" ariaLabel="148 notifications" />
<j-badge value="Paid" severity="success" variant="soft" icon="check" />
<j-badge dot severity="warning" ariaLabel="Service degraded" />
<j-badge value="Archived" variant="outlined" muted />
```

## Tag

```ts
import { JTagComponent } from 'jrng-ui/tag';
```

```html
<j-tag label="Approved" severity="success" />
<j-tag label="Review pending" severity="warning" removable (remove)="removeTag()" />
```

## Avatar

```ts
import { JAvatarComponent } from 'jrng-ui/avatar';
```

```html
<j-avatar label="User One" initials="UO" />
<j-avatar image="/assets/user.jpg" ariaLabel="Account avatar" size="lg" status="online" />
```

## Avatar Group

```ts
import { JAvatarGroupComponent } from 'jrng-ui/avatar-group';
```

```html
<j-avatar-group [items]="teamMembers" [max]="4" ariaLabel="Team members" />
```

## Divider

```ts
import { JDividerComponent } from 'jrng-ui/divider';
```

```html
<j-divider />
<j-divider lineStyle="dashed" strength="strong" />
<j-divider text="Account settings" icon="settings" position="start" inset />
<j-divider layout="vertical" spacing="compact" />
```

## Loader

```ts
import { JLoaderComponent } from 'jrng-ui/loader';
```

```html
<j-loader [size]="24" [strokeWidth]="3" label="Loading records" />
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
<j-skeleton variant="text" width="14rem" />
<j-skeleton variant="avatar" />
<j-skeleton variant="card" />
<j-skeleton variant="table" [rows]="5" />
<j-skeleton variant="text" [animated]="false" />
```

## Empty State

```ts
import { JEmptyComponent } from 'jrng-ui/empty';
```

```html
<j-empty title="No orders found" description="Try changing filters." icon="empty">
  <j-button jEmptyStateAction label="Create order" />
</j-empty>

<j-empty title="No tasks" description="Create a task to get started." compact />
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

## Copy Button

```ts
import { JCopyButtonComponent } from 'jrng-ui/copy-button';
```

```html
<j-copy-button text="INV-1001" label="Copy invoice number" />
```

## Status Chip

```ts
import { JStatusChipComponent } from 'jrng-ui/status-chip';
```

```html
<j-status-chip label="Active" severity="success" />
<j-status-chip label="Pending" severity="warning" size="sm" />
```
