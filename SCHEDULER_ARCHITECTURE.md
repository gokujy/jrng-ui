# JRNG Scheduler architecture

## Audit baseline

- The workspace uses Angular 21.2, strict TypeScript, standalone components, signals, `OnPush`, Vitest through the Angular test runner, Playwright for documentation E2E tests, and ng-packagr secondary entry points.
- The existing scheduling surface is `JCalendarSchedulerComponent` at `jrng-ui/calendar-scheduler` with selector `j-calendar-scheduler`. It renders a basic month/week/day card grid and agenda list. It has no time grid, year or timeline renderer, resources, selection model, drag/resize, recurrence, availability, controlled event mutations, import/export, overlays, virtualization, or scheduler-specific documentation page.
- Existing public compatibility to retain: `JCalendarSchedulerComponent`, `JCalendarSchedulerView`, `JCalendarSchedulerEvent`, `JCalendarSchedulerEventClick`, `JCalendarSchedulerDateClick`, `j-calendar-scheduler`, `activeDate`, `showWeekends`, `maxEventsPerDay`, `hour12`, `styleClass`, `selectView()`, and the `jrng-ui/calendar-scheduler` entry point.
- Reusable JRNG infrastructure exists for Button, Select, Date Picker, Time Picker, Dialog, Popover, Context Menu, Tooltip, Drawer, Virtual Scroller, drag/drop primitives, icons, overlays, focus restoration, overlay positioning/listeners, and theme tokens.
- Direct dependencies are Angular, RxJS, and tslib. No date, timezone, recurrence, or calendar UI dependency is installed. The scheduler will use independent date math and `Intl`; no dependency is required.
- The library currently has 139 ng-packagr entry points, 129 component sources, and 210 specs. Generated registries and documentation inventory are maintained by repository scripts.

## Public architecture decision

The production API is `JSchedulerComponent` with selector `j-scheduler` and modular entry point `jrng-ui/scheduler`. The legacy calendar scheduler remains as a deprecated compatibility facade and re-export. Compatibility types accept their historic string-date fields at the facade boundary; the new API keeps normalized values as `Date` objects.

One root controller coordinates controlled inputs and emits immutable requests. View-specific renderers consume a shared render context. Pure engines remain independent of Angular templates:

1. `models/` contains all public `JScheduler*` contracts and typed template contexts.
2. `engine/date-engine.ts` owns civil-date math, visible ranges, week numbers, slots, and display-zone projection.
3. `engine/event-engine.ts` normalizes events, intersects visible ranges, lays out month spans and deterministic timed/timeline overlaps, and validates conflicts/capacity.
4. `engine/recurrence-engine.ts` parses the supported RFC 5545-style subset and expands only a bounded visible range.
5. `engine/resource-engine.ts` flattens hierarchy, tracks expansion, filtering, aggregation, and capacity.
6. `engine/availability-engine.ts` evaluates business hours, blocked intervals, selection constraints, and appointment capacity.
7. `engine/serialization/` handles JSON, CSV, and ICS normalization, previews, validation, and merge strategies without mutating live state.
8. `renderers/` contains month, time-grid, agenda, year, timeline, and resource renderers. All are internal standalone components using the same event and interaction contracts.
9. `interaction/` owns pointer capture, selection, drag, resize, snap geometry, auto-scroll, reversible proposals, keyboard movement, and announcements.
10. `scheduler.component` owns the toolbar, view registry, render context, overlays, public methods, focus restoration, SSR guards, and zoneless state updates.

## State contract

- Inputs are authoritative. The component never mutates consumer events, resources, categories, appointments, filters, or selections.
- Navigation and view methods emit typed changes and maintain a proposed local value only where an input is not externally updated, preserving the existing model-style experience without creating a second event store.
- Event add/change/remove, drag, resize, recurrence scope, booking, and bulk methods emit requests. A proposal includes a one-shot `revert()` callback that restores transient presentation only; accepted data must return through inputs.
- IDs, never array indexes, define identity and stable tracking.
- Recurrence occurrences are ephemeral render records derived from a source series and exceptions.

## View registry

The registry maps every `JSchedulerView` to a view family, navigation unit, visible-range factory, renderer, interaction capability flags, and default header units. Adding a view extends this registry instead of branching throughout the root.

View families:

- Month: `month`, `resourceMonth`, `dateMonth`
- Time grid: `day`, `week`, `resourceDay`, `resourceWeek`, `dateDay`, `dateWeek`
- Document/overview: `agenda`, `year`
- Timeline: `timelineDay`, `timelineWeek`, `timelineMonth`, `timelineYear`, `resourceTimelineDay`, `resourceTimelineWeek`, `resourceTimelineMonth`

## Accessibility and interaction rules

- Disabled removes interactive descendants from tab order and blocks pointer, keyboard, selection, overlay, booking, drag, and resize entry points.
- Readonly keeps navigation and inspection while blocking all mutation proposals.
- Grids use roving tabindex, localized accessible date/event names, selected/today/disabled states, logical-direction keyboard movement, and live announcements.
- All icon-only and disclosure actions use JRNG Button and Tooltip. Overlays use JRNG overlay positioning/lifecycle and restore focus.
- Pointer interactions use pointer capture and a single active gesture controller, with document listeners installed only for the gesture lifetime and removed on completion/destruction.

## Rendering and performance rules

- Visible range, recurrence expansion, resource flattening, slot generation, and geometry are memoized signals or pure functions.
- Only intersecting events are normalized for rendering.
- Month spans are row segments with continuation metadata, not unrelated daily copies.
- Timed overlaps use stable interval partitioning ordered by start, duration, and stable ID.
- Timeline columns and resource rows expose virtual windows with configurable thresholds and overscan; spacer geometry preserves scroll size.
- Renderers own one scrolling surface per axis and synchronize sticky rails/headers from that surface.

## Delivery phases

1. Preserve this audit and architecture decision.
2. Introduce models, engines, new entry point, controlled root state, and toolbar.
3. Add month, time-grid, agenda, and year renderers with deterministic placement.
4. Add selection, pointer drag/drop, resize, validation, and revert proposals.
5. Add bounded recurrence, business hours, blocks, and appointments.
6. Add resources, grouping, timelines, adaptive resource selection, and virtualization.
7. Add JRNG overlays, inline title editing, typed templates, and stable hooks.
8. Add `Intl` localization/timezone projection, RTL geometry, serialization, and print.
9. Add scheduler tokens/preset integration, dark mode, print, and responsive ownership.
10. Add the documentation catalog, independent examples, API reference, unit/component/a11y/E2E/performance coverage, package verification, and final measurements.

No scheduler-specific third-party package is planned. Any future dependency proposal requires an ADR demonstrating a standards or correctness gap that cannot reasonably be handled by `Intl` and the bounded engines above.
