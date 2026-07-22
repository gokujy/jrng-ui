# JRNG UI Overlay And Feedback

JRNG UI overlay and feedback components are standalone Angular APIs with `j-*` selectors, `.j-*` classes, original styling, SSR-safe listener cleanup, focus handling, and design-token-driven visuals.

## Imports

```ts
import { JDialogComponent } from 'jrng-ui/dialog';
import { JDynamicDialogComponent } from 'jrng-ui/dynamic-dialog';
import { JDrawerComponent } from 'jrng-ui/drawer';
import { JBottomSheetComponent } from 'jrng-ui/bottom-sheet';
import { JToastContainerComponent, JToastService } from 'jrng-ui/toast';
import { JConfirmDialogComponent, JConfirmationService } from 'jrng-ui/confirm-dialog';
import { JConfirmPopupComponent } from 'jrng-ui/confirm-popup';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { JPopoverComponent } from 'jrng-ui/popover';
import { JOverlayPanelComponent } from 'jrng-ui/overlay-panel';
import { JNotificationCenterComponent } from 'jrng-ui/notification-center';
import { JCommandPaletteComponent, JCommandPaletteItem } from 'jrng-ui/command-palette';
```

Root imports are also supported from `jrng-ui`.

## Shared append target

Connected overlays use one `JAppendTo` contract: `'self'`, `'body'`, an `HTMLElement`, or a selector string. A component input overrides `provideJrngUI({ appendTo })`; global configuration overrides the compatible `'self'` default. Selectors resolve through Angular's injected `DOCUMENT`. Missing or invalid selectors safely fall back to local rendering. Portalled panels are repositioned on nested scroll and resize, receive a managed z-index, and are restored to their Angular-owned location when closed so no orphan node or listener remains. Server rendering never resolves or appends a target.

```ts
provideJrngUI({ appendTo: 'body', zIndex: { modal: 2000, popover: 2100 } });
```

```html
<j-select appendTo="#workspace-overlays" /> <j-popover [appendTo]="overlayElement" />
```

## j-dialog

```html
<j-dialog
  header="Update payment"
  [(visible)]="dialogVisible"
  size="lg"
  position="center"
  [modal]="true"
  [dismissableMask]="true"
  [closeOnEscape]="true"
  draggable
  resizable
>
  <form>...</form>
  <j-button jDialogFooter variant="ghost" (onClick)="dialogVisible = false">Cancel</j-button>
  <j-button jDialogFooter>Save</j-button>
</j-dialog>
```

`j-dialog` supports focus trap, focus restore, escape close, dismissable mask, header/footer projection, `sm | md | lg | xl | full` sizes, multiple positions, optional drag/resize, headless mode, body scroll lock, z-index management, and `model()`-backed `[(visible)]`.

## j-dynamic-dialog

```html
<j-dynamic-dialog />
```

```ts
dialog.open({
  title: 'Invoice ready',
  message: 'The invoice can now be reviewed.',
  size: 'md',
});
```

## j-drawer

```html
<j-drawer header="Filters" position="right" [(visible)]="filtersOpen" [snapPoints]="['45%', '82%']">
  ...
  <j-button jDrawerFooter (onClick)="filtersOpen = false">Apply</j-button>
</j-drawer>
```

Supported positions are `left`, `right`, `top`, and `bottom`. The drawer includes focus trap, focus restore, escape close, body scroll lock, drag handle, gesture close, and mobile bottom-sheet styling.

## j-bottom-sheet

```html
<j-bottom-sheet header="Order actions" [(visible)]="actionsOpen" [snapPoints]="['40%', '80%']">
  <button>Archive</button>
  <button>Duplicate</button>
</j-bottom-sheet>
```

## Toasts

Place one or more toast containers in the app shell:

```html
<j-toast position="top-right" /> <j-toast position="bottom-center" />
```

Use the service:

```ts
toast.success('Customer saved', 'Saved');
toast.error('File could not be uploaded', 'Error', { life: 8000 });
toast.show({
  severity: 'info',
  summary: 'Report ready',
  detail: 'The file is available for download.',
  sticky: true,
  actions: [{ label: 'Open', style: 'primary', command: () => this.openReport() }],
  cancelAction: { label: 'Dismiss', command: () => undefined },
});
```

Promise toast:

```ts
toast.promise(loadOrders(), {
  loading: { summary: 'Loading orders', sticky: true },
  success: { summary: 'Orders loaded' },
  error: { summary: 'Orders unavailable' },
});
```

Toasts support stacked positions, rich severities, actions, cancel action, sticky mode, duration, pause on hover, swipe dismiss, and custom templates.

## Confirm Dialog And Popup

Place one dialog and one popup host:

```html
<j-confirm-dialog /> <j-confirm-popup />
```

Dialog request:

```ts
confirmation.confirm({
  header: 'Delete task?',
  message: 'This task will be removed.',
  severity: 'danger',
  acceptLabel: 'Delete',
  rejectLabel: 'Cancel',
  accept: () => this.deleteTask(),
});
```

Anchored popup request:

```ts
confirmation.confirm({
  target: buttonElement,
  header: 'Archive order?',
  message: 'The order will move out of the active list.',
  accept: () => this.archiveOrder(),
});
```

## Tooltip

```html
<button jTooltip="Export orders" tooltipPosition="bottom" [showDelay]="250">Export</button>
```

Inputs: `tooltipPosition`, `showDelay`, `hideDelay`, `tooltipDisabled`.

## Popover

```html
<j-button #trigger label="More" (onClick)="popover.open(trigger)" />
<j-popover #popover [target]="trigger">
  <j-button label="Archive" variant="text" />
  <j-button label="Export" variant="text" />
</j-popover>
```

`j-popover` supports anchored positioning, outside-click and Escape dismissal, focus restoration, stacking, and `[(visible)]`.

## Notification Center

```html
<button #bell type="button" (click)="notifications.visible.set(true)">Notifications</button>
<j-notification-center #notifications [target]="bell" />
```

The notification center reads active toasts from `JToastService` and provides a compact generic review surface.

## Command Palette

```ts
commands: readonly JCommandPaletteItem[] = [
  { label: 'Create customer', group: 'Customers', icon: '+', command: () => this.createCustomer() },
  { label: 'Open invoices', group: 'Invoices', keywords: ['billing'] },
];
```

```html
<j-command-palette [commands]="commands" shortcut="k" (command)="handleCommand($event)" />
```

The command palette supports `Ctrl/Meta + K`, search, groups, icons, keyboard navigation, empty state, and command execution.
