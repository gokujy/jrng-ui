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

## Verification audit — 2026-08-08

The production implementation now covers the Scheduler master specification as an independent JRNG platform, subject only to the explicit standards and browser boundaries recorded below. The focused audit verified the following classifications.

### Existing and working

- Standalone `j-scheduler`, OnPush rendering, strict public contracts, controlled events/resources, and the deprecated `j-calendar-scheduler` compatibility entry point.
- Month, time-grid, agenda, year, timeline, hierarchical resource timeline, bounded recurrence, availability/block validation, appointment capacity, timezone projection, JSON/CSV/ICS serialization, responsive themes, print CSS, horizontal timeline virtualization, and immutable change proposals.
- Complete default 00:00–24:00 30-minute Week/Day grids, independently configurable label intervals, solid hour/lighter sub-slot separators, deterministic timed overlap geometry, continuous multi-day Month segments, accurate Month hidden counts, and accessible more-events/quick-info popovers.
- Month cross-date drag and date-span resize proposals, including Alt+Arrow movement and Alt+Shift+Arrow resizing, without mutating controlled event data.
- Work-week, quarter timeline, resource-timeline-year, multi-month/year aliases, and custom duration/range definitions in the shared view registry.
- Custom definitions select day-grid, time-grid, agenda, timeline, resource-time-grid, or resource-timeline renderers and can override slot duration without modifying the root registry.
- Internal copy/cut/paste with relative multi-event offsets, keyboard shortcuts, optional controlled undo/redo, cancellable remote range requests, explicit range caching, adjacent-range prefetch, and loading/error/retry states.
- Public recurrence rule parsing/serialization/summary, ordinal weekdays, negative month days, absent-date skipping, occurrence exceptions, future-series splitting, scoped deletion, and the reusable `j-recurrence-editor`.
- Structured overlap, capacity, attendee, block, business-hour, buffer, notice, advance-window, eligibility, and asynchronous custom conflicts.
- Horizontal timeline and vertical resource-row virtualization can operate together without mounting the complete resource dataset.
- Backward-compatible Excel SpreadsheetML plus native dependency-free ZIP-based XLSX, Scheduler PDF bytes, richer ICS recurrence/timezone fields, and import preview warnings for duplicates, unknown resources, and overlaps.
- Library-neutral external/cross-Scheduler drag payloads, native HTML drag adapters, grouped multi-event offsets, controlled drop validation, and non-pointer bulk Move methods.
- Agenda virtualization and print-time virtualization suspension so logical timeline/resource/agenda rows are mounted for browser printing.
- A reusable `j-scheduler-event-editor` and one optional Scheduler-owned JRNG Dialog instance for create, update, delete, recurrence, resource, category, timezone, attendee, status, and priority workflows; app-owned editors remain supported through typed requests.
- Resource time grids render simultaneous date-first/resource-first leaf lanes, resource-aware selection and cross-resource movement; timeline parent rows render descendant aggregate events.
- Independent typed resource dimensions compose into deterministic immutable Cartesian hierarchies; leaf events require every dimension assignment to match, while generated IDs and readable path labels remain stable.
- Resource timeline rails emit immutable controlled reorder requests from native pointer drag/drop and Alt+Arrow keyboard movement; source arrays remain untouched until the parent accepts a proposal.
- Resource time grids can opt into parent aggregate columns that render descendant assignments beside leaf lanes with explicit semantic aggregate markers.
- One Scheduler-owned non-drag Move dialog lets keyboard/mobile users move single or selected events by date, time, and resource through the same immutable bulk proposal path as pointer movement.
- Timeline events support proportional snapped pointer drag/resize and Alt+Arrow keyboard movement; resource timelines also move across leaf lanes with scroll-aware vertical coordinates and preserve composed dimension assignments.
- Scheduler PDF export paginates the complete requested event collection with repeated titles/generated metadata and page numbers, plus view-aware vector Month grids and proportional Timeline/Resource Timeline lanes, instead of truncating after one page.
- IANA wall-time conversion exposes explicit DST gap/repeated-hour disambiguation, and bounded daily/weekly/monthly/yearly recurrence advances in the event timezone so wall times survive offset transitions.
- Resource counts are indexed in one assignment/aggregation pass; the representative suite covers 20,000 events across 500 virtualized resource rows.
- Typed month, time-grid, all-day, agenda, timeline, cell, and resource-row templates are propagated into Scheduler-owned interactive shells, preserving geometry, focus, activation, drag/resize state, disabled state, and ARIA semantics.
- Typed weekday/date-number/day/time/timeline headers, appointment slots, blocked intervals, and Month overflow triggers are also projected inside Scheduler-owned semantic shells.
- Granular board/event/resource permissions independently control add, edit, remove, booking, selection, drag, resize, cross-resource movement, and resource reorder operations.
- Event adapters accept immutable backend-owned records, controlled visible ranges let applications own range state, and remote range requests include search, cursor, page-size, resource, timezone, filter, abort, cache, and prefetch context.
- Asynchronous application guards hold drag/resize proposals in an ARIA-busy validation state and never emit controlled mutations before acceptance.
- Timeline views provide configurable multi-level year/quarter/month/week/day/hour headers, current-time markers, bounded zoom, synchronized rails, and combined time/resource virtualization.
- Month, time-grid, and timeline cells use one roving tab stop with Arrow, Home, End, PageUp, PageDown, Enter, Space, logical RTL navigation, live announcements, and the same validation path as pointer operations.
- Pointer interactions include edge auto-scroll, configurable touch long-press gating, start/end resize handles, scroll-aware geometry, and non-pointer movement alternatives.
- Milestone events render as point-in-time records, and JSON round trips availability, blocked intervals, appointment slots, resources, categories, recurrence, exceptions, events, and optional metadata with normalized dates.
- The Scheduler live region announces drag/resize starts and outcomes, validation rejections, resource reordering, booking outcomes, clipboard operations, and undo/redo with the same messages for pointer and keyboard paths.
- Pointer and touch gestures transfer events between independent controlled Scheduler instances through an SSR-safe host registry, shared validation payloads, and no document listener per event.
- Context-menu requests resolve the nearest event, date/time, and resource from stable semantic data attributes instead of exposing private DOM depth.
- The documentation catalog contains 87 independent deferred Scheduler scenarios, with live high-value previews for controlled selection, event adapters, asynchronous validation, custom/header templates, footer/custom toolbars, availability, appointment display modes, virtual scrolling, adaptive resources, overflow modes, external drop, built-in editing/non-drag movement, timeline zoom/drag/resize, resources, recurrence, import/export, print, RTL, dark mode, and keyboard operation.

### Existing but incomplete

- Resource time-grid views provide adaptive single-resource filtering, simultaneous date-first or resource-first vertical leaf-resource lanes, independent multi-dimension composition, and opt-in parent aggregate columns.
- Recurrence supports bounded daily/weekly/monthly/yearly expansion, positional fields, edit scopes and IANA wall-time advancement through DST gaps/repeated hours; exhaustive RFC 5545 conformance beyond the documented subset is not claimed.
- Browser print styling, print headers/metadata, non-breaking logical rows and logical virtual-row materialization exist; repeated DOM headers across every browser-generated page remain browser-dependent.
- PDF generation produces complete paginated document-flow schedules and view-aware Month/Timeline geometry; advanced collision packing is intentionally simpler than the interactive surface.

### Missing or intentionally deferred

- Repeated browser-controlled paginated DOM headers.
- Exhaustive gesture-by-gesture Playwright coverage across every view; all 87 documented preview containers have a catalog-wide E2E smoke test and the high-risk workflows have dedicated behavioral E2E cases.

No missing feature is hidden behind a license, entitlement, trial, watermark, commercial package, or artificial data limit. Deferred work must remain unavailable rather than compile into misleading no-op APIs.

## Verification results

- Scheduler-focused Vitest: 22 files, 135 tests passed.
- Complete workspace Vitest: all library tests (1,055 at the final audit baseline) and all documentation tests passed.
- Scheduler Playwright: 22 production-preview workflows passed, including native XLSX/PDF generation, touch long-press transfer, controlled range selection, adapters, toolbars, availability and appointment lanes.
- Production library, documentation application, SSR smoke consumer, strict 144-entry-point API consumer, 132-component registry, adjacent-spec coverage, component categories, and external consumer verification passed.
- Package verification: 300 files, 733,767 bytes packed and 4,843,691 bytes unpacked. The complete Scheduler FESM is 588,340 bytes and remains below its explicit 595,000-byte regression ceiling.
- Scheduler-scoped lint and `git diff --check` passed. Full-repository lint remains blocked by three unrelated pre-existing `no-useless-assignment` errors in core clipboard, date-picker, and gallery. Documentation completeness is 132/132; the aggregate content validator remains blocked by unrelated existing Org Chart/Tree duplicate examples and Table filtering-content failures.
- No commit, push, publication, deployment, license change, entitlement check, or commercial feature gate was created by this work.
