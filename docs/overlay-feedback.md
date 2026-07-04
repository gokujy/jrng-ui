# JRNG UI Overlay And Feedback

JRNG UI overlay components are standalone Angular APIs with `j-*` selectors/classes and no PrimeNG dependency.

## Imports

```ts
import { JDialogComponent } from 'jrng-ui/dialog';
import { JDrawerComponent } from 'jrng-ui/drawer';
import { JToastContainerComponent, JToastService } from 'jrng-ui/toast';
import { JConfirmDialogComponent, JConfirmationService } from 'jrng-ui/confirm-dialog';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { JPopoverComponent } from 'jrng-ui/popover';
import { JOverlayPanelComponent } from 'jrng-ui/overlay-panel';
import { JMenuComponent, JMenuItem } from 'jrng-ui/menu';
```

Root imports are also supported from `jrng-ui`.

## j-dialog

```html
<j-dialog
  header="Edit invoice"
  [(visible)]="dialogVisible"
  size="lg"
  position="center"
  [modal]="true"
  [dismissableMask]="true"
  [closeOnEscape]="true"
>
  <form>...</form>
  <j-button jDialogFooter variant="text" (clicked)="dialogVisible = false">Cancel</j-button>
  <j-button jDialogFooter>Save</j-button>
</j-dialog>
```

Implemented: content projection, header/footer slots, modal mask, escape close, focus trap, body scroll lock, and focus restore.

## j-drawer

```html
<j-drawer header="Filters" position="right" [(visible)]="filtersOpen">
  ...
  <j-button jDrawerFooter (clicked)="filtersOpen = false">Apply</j-button>
</j-drawer>
```

Supported positions: `left`, `right`, `top`, `bottom`.

## Toasts

Place a toast container once in the app shell:

```html
<j-toast position="top-right" />
```

Use the service:

```ts
toast.success('Invoice saved', 'Saved');
toast.error('Export failed', 'Error', { life: 8000 });
toast.show({
  severity: 'info',
  summary: 'Report ready',
  detail: 'The file is available for download.',
  sticky: true,
  closable: true,
  position: 'bottom-right',
});
toast.clear();
```

## Confirm Dialog

Place the dialog once:

```html
<j-confirm-dialog />
```

Request confirmations from code:

```ts
confirmation.confirm({
  header: 'Delete invoice?',
  message: 'Removed invoices cannot be restored.',
  icon: '!',
  severity: 'danger',
  acceptLabel: 'Delete',
  rejectLabel: 'Cancel',
  accept: () => this.deleteInvoice(),
});
```

## Tooltip

```html
<button jTooltip="Export report" tooltipPosition="bottom" [showDelay]="250">Export</button>
```

Inputs: `tooltipPosition`, `showDelay`, `hideDelay`, `tooltipDisabled`.

## Popover

`j-popover` is a lightweight projected overlay. It exposes `show()`, `hide()`, and `toggle()`.

```html
<j-popover [(visible)]="helpOpen" position="bottom">
  Help content
</j-popover>
```

Current limit: automatic anchor positioning is not implemented yet.

## Overlay Panel

```html
<j-overlay-panel #panel>
  <button>Archive</button>
  <button>Export</button>
</j-overlay-panel>
```

Current limit: automatic anchor positioning is not implemented yet; use local layout or wrapper positioning.

## Menu

```ts
items: readonly JMenuItem[] = [
  { label: 'Edit', icon: 'edit', command: () => this.edit() },
  { separator: true },
  { label: 'Delete', icon: 'trash', disabled: false, command: () => this.delete() },
];
```

```html
<j-menu [model]="items" popup [(visible)]="menuOpen" />
```

`j-menu` supports arrow-key navigation, `Enter`/space activation, disabled items, separators, and popup visibility.
