# Mobile interactions

## Overview and imports

`j-pull-to-refresh` adds an optional touch refresh gesture without removing the visible refresh command required by keyboard and desktop users. `j-swipe-actions` reveals logical start and end actions while preserving vertical scrolling.

```ts
import { JPullToRefreshComponent } from 'jrng-ui/pull-to-refresh';
import {
  JSwipeActionsComponent,
  JSwipeContentDirective,
  JSwipeEndActionsDirective,
  JSwipeStartActionsDirective,
} from 'jrng-ui/swipe-actions';
```

Both standalone components use the shared `jrng-ui/gesture` Pointer Events foundation. They do not depend on another UI library.

## Pull To Refresh

### Basic and async usage

```html
<j-pull-to-refresh [refresh]="loadCustomers">
  <app-customer-list [customers]="customers()" />
</j-pull-to-refresh>
```

```ts
readonly loadCustomers = async (): Promise<void> => {
  this.customers.set(await this.customerService.list());
};
```

The promise controls the `refreshing` and `completing` states. Rejections emit `refreshError`, announce failure, and return safely to idle. A second request cannot start while one is running.

For controlled state, bind `[refreshing]="refreshing()"`, react to `(refreshRequested)`, and call `complete()` after the parent operation settles. `reset()` cancels the visual state, while `beginRefresh()` is the keyboard and desktop alternative.

### Custom scrolling and indicator

```html
<div #customerScroller class="customer-scroller">
  <j-pull-to-refresh
    [scrollContainer]="customerScroller"
    [threshold]="64"
    [maxPullDistance]="120"
    [indicatorTemplate]="indicator"
    (pullProgressChange)="progress.set($event)"
  >
    <app-customer-list />
  </j-pull-to-refresh>
</div>

<ng-template #indicator let-state let-progress="progress">
  <span>{{ state }} · {{ progress | percent }}</span>
</ng-template>
```

Pulling is accepted only when the configured element, or the document when no element is supplied, is at its top. Downward movement uses the configured resistance and clamps at `maxPullDistance`; ordinary vertical scrolling remains available otherwise.

Inputs include `refreshing`, `disabled`, `threshold`, `maxPullDistance`, `resistance`, `completeDelay`, state labels, `indicatorTemplate`, `scrollContainer`, and `refresh`. Outputs are `refreshRequested`, `pullProgressChange`, `stateChange`, and `refreshError`. The indicator template receives `state`, `progress`, and `text`.

## Swipe Actions

### Basic and advanced usage

```html
<j-swipe-actions #row group="customers" ariaLabel="Actions for Aster Labs">
  <ng-template jSwipeStartActions>
    <j-button label="Activate customer" severity="success" />
  </ng-template>
  <ng-template jSwipeContent>
    <strong>Aster Labs</strong>
    <span>CUS-2048 · Technology · Active</span>
  </ng-template>
  <ng-template jSwipeEndActions>
    <j-button label="Archive customer" severity="danger" (onClick)="archive(row)" />
  </ng-template>
</j-swipe-actions>
```

```ts
async archive(row: JSwipeActionsComponent): Promise<void> {
  await row.triggerAction('end', false, () => this.customerService.archive('CUS-2048'));
}
```

`open('start' | 'end')`, `close()`, and `reset()` provide desktop and controlled workflows. `triggerAction()` prevents duplicate execution, supports an async confirmation callback, retains the open side on error, and restores content focus after success. Rows sharing `group` enforce one open row.

Inputs include `disabled`, `readOnly`, `group`, `direction`, `openThreshold`, `fullSwipeThreshold`, `actionWidth`, `fullSwipe`, `destructiveConfirmation`, `ariaLabel`, and `loadingText`. Outputs are `openChange`, `actionTriggered`, `actionCompleted`, and `actionError`. Templates are `jSwipeStartActions`, `jSwipeContent`, and `jSwipeEndActions`.

## States, accessibility, and keyboard

Pull To Refresh exposes idle, pulling, ready, refreshing, completing, disabled, and async-failure feedback. A polite live region announces refresh activity. Always retain a named `j-button` that calls `beginRefresh()` because a touch gesture cannot be the only path to essential functionality.

Swipe Actions exposes closed, start-open, end-open, loading, disabled, read-only, success, and error behavior. Left/Right Arrow opens an available side, Escape closes and restores focus, and projected `j-button` controls remain keyboard reachable. The content surface exposes `aria-expanded` and `ariaLabel`.

Disabled states block pointer, keyboard, and programmatic mutation. Read-only Swipe Actions preserves row content but blocks actions. Both components use visible browser focus styles, forced-color-safe boundaries, and polite status announcements.

## Responsive, RTL, motion, SSR, and themes

Both components are container responsive. Swipe Actions maps logical start/end automatically from its `direction`; Pull To Refresh is vertical and direction neutral. Shared gesture axis locking avoids interpreting ordinary vertical scrolling as a row action.

Transitions and the refresh spinner stop under `prefers-reduced-motion: reduce`. Components use semantic `--j-*` tokens, so Default, Material, and Nexus presets inherit light, dark, system, and high-contrast values. Override `--j-pull-refresh-indicator-color`, `--j-pull-refresh-surface`, or `--j-swipe-actions-width` locally when needed.

Browser globals and document listeners are guarded by the platform identifier. Server rendering emits stable idle markup; hydration installs gesture and dismiss listeners in the browser. Pointer Events are required for gesture input, but programmatic and keyboard alternatives remain functional when touch input is unavailable.

## Testing guidance

For Pull To Refresh, test top-of-scroll gating, resistance and threshold boundaries, cancel, controlled refreshing, duplicate prevention, promise success and failure, custom indicators, reduced motion, SSR creation, timer cleanup, and destruction during an active request.

For Swipe Actions, test horizontal/vertical discrimination, start/end thresholds, RTL, full swipe, confirmation cancellation, group coordination, outside/scroll/Escape closing, focus restoration, async success/error, disabled/read-only behavior, and listener cleanup. Assert the accessible name and live-region output rather than implementation transforms alone.

## FAQ

**Can Pull To Refresh replace a refresh button?** No. Keep a visible keyboard-accessible command and call `beginRefresh()`.

**Who changes customer data after a full swipe?** The application handles `actionTriggered` or supplies work to `triggerAction()`; JRNG manages interaction state, not domain data.

**Why does a row close while the page scrolls?** Open rows close on scroll to avoid leaving actions visually detached from moving content.

**Can actions be destructive?** Yes, but supply `destructiveConfirmation` for destructive full-swipe behavior.

## Changelog

- 0.1.1 (unreleased): added Pull To Refresh and Swipe Actions as beta mobile-interaction components.
