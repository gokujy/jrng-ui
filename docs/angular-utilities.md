# Angular Utilities

JRNG UI exposes small Angular-first utilities from `jrng-ui/core`. They are standalone-friendly, typed, SSR-safe, and do not require Tailwind or another UI framework.

## Imports

```ts
import {
  JClipboardService,
  JCopyToClipboardDirective,
  JMediaQueryService,
  JKeyboardShortcutsService,
  JHotkeyDirective,
  JResizeObserverDirective,
  JIntersectionObserverDirective,
  JStorageService,
  jDebounce,
  jThrottle,
  jCreateDisclosure,
  jCreatePagination,
} from 'jrng-ui/core';
```

## Clipboard

Use `JClipboardService` when application code needs a result object. It uses the Clipboard API when available, falls back to a temporary textarea in browsers that support copy commands, and returns `unavailable` during SSR.

```ts
const result = await this.clipboard.copyText(orderNumber);

if (result.status === 'success') {
  this.toast.success('Copied');
}
```

For template-only usage, use the directive:

```html
<button
  type="button"
  [jCopyToClipboard]="customer.email"
  (jCopySuccess)="copied = true"
  (jCopyError)="copyError = $event"
>
  Copy email
</button>
```

## Storage

`JStorageService` stores JSON values with a version wrapper and optional key prefix. It catches parse errors and storage access failures so private browsing, SSR, corrupted data, and unavailable storage do not crash the application.

```ts
this.storage.set('orders-grid', state, { prefix: 'app', version: 1 });
const state = this.storage.get<GridState>('orders-grid', { prefix: 'app', version: 1 });
```

## Media Queries

`JMediaQueryService` provides observable media query state with listener cleanup.

```ts
readonly isDesktop$ = this.media.observeBreakpoint('lg');
readonly reducedMotion = this.media.prefersReducedMotion();
readonly darkMode = this.media.prefersDarkColorScheme();
```

Supported breakpoint names are `xs`, `sm`, `md`, `lg`, `xl`, and `xxl`.

## Keyboard Shortcuts

Use `JKeyboardShortcutsService` for programmatic hotkeys. Shortcuts ignore editable fields by default.

```ts
private readonly cleanup = this.shortcuts.register(
  'ctrl+k',
  () => this.commandPalette.open(),
  { preventDefault: true },
);

ngOnDestroy(): void {
  this.cleanup();
}
```

Use `jHotkey` when a template-level shortcut is sufficient:

```html
<section jHotkey="ctrl+k" (jHotkeyPressed)="openCommands()"></section>
```

## Timing Helpers

`jDebounce` and `jThrottle` return cancellable functions. Cancel pending callbacks when a component is destroyed.

```ts
readonly search = jDebounce((query: string) => this.load(query), 250);

ngOnDestroy(): void {
  this.search.cancel();
}
```

## Observer Directives

`jResizeObserver` and `jIntersectionObserver` wrap browser observers and disconnect automatically.

```html
<div jResizeObserver (jResize)="size = $event.contentRect"></div>
<section jIntersectionObserver (jIntersect)="visible = $event.isIntersecting"></section>
```

## Disclosure and Pagination

`jCreateDisclosure` and `jCreatePagination` provide reusable typed state helpers for menus, dialogs, accordions, drawers, and paginated views. They are framework-independent and safe to use in tests.
