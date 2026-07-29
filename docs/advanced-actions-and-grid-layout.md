# Advanced actions and grid layout

## Overview

JRNG UI provides determinate Button progress, Speed Dial quick actions, and an opt-in
interactive mode for Grid Layout. Import them from `jrng-ui/button`,
`jrng-ui/speed-dial`, and `jrng-ui/grid-layout`. Existing Button loading and
lightweight projected Grid Layout usage remain backwards compatible.

## Basic and advanced usage

Use `[progress]` from 0 through 100 with `progressState="running"` and
`progressLabel` for a determinate operation. Values are clamped. A running action
blocks duplicate activation by default; `cancelable` changes activation to the
`cancel` output. Finish with `success`, `error`, or `cancelled`.

Speed Dial accepts `JSpeedDialAction[]` and supports linear `up`, `down`, `left`,
and `right` directions plus `circle` and `semi-circle` distributions. Use
`fixed` with a logical `position`, or leave it container-relative. A
`jSpeedDialTrigger` template can render a custom JRNG Button. Commands may return
a promise; per-action loading is shown until completion, and `actionError`
reports failures.

Grid Layout keeps its projected CSS-grid mode when `layout` is empty. Provide a
controlled `[(layout)]` to activate item rendering, then opt into `draggable`
and/or `resizable`. `JGridLayoutItem` defines column, row, spans, min/max spans,
locking, and application data. `jGridLayoutItem` renders that data.
`responsiveLayouts` stores named layouts; call `applyResponsiveLayout(name)`
from the application's breakpoint observer. `persistence` receives each
committed layout, and `reset()` restores the initial layout.

## Inputs, outputs, methods, and templates

Button adds `progress`, `progressLabel`, `progressState`, `cancelable`, and
`blockWhileRunning`, plus `cancel`. Speed Dial exposes actions, direction, type,
radius, fixed positioning, mask, hover activation, labels, icons, disabled
state, and two-way `open`; outputs cover click, completion, error, opened, and
closed. Its public methods are `show`, `close`, `toggle`, and `runAction`.

Grid Layout adds `layout`, `rowHeight`, `draggable`, `resizable`, `collision`,
`compact`, `responsiveLayouts`, and `persistence`. `layoutChangeEvent`,
`resizeStarted`, and `resizeEnded` describe changes. Public methods include
`moveItem`, `resizeItem`, `startResize`, `applyResponsiveLayout`, and `reset`.
The `jGridLayoutItem`, `jGridLayoutDragHandle`, and
`jGridLayoutResizeHandle` directives support templates and handles.

## States and asynchronous behaviour

Button retains disabled and indeterminate loading states. Determinate progress
adds idle, running, success, error, and cancelled states. Speed Dial disables
individual actions, renders asynchronous action loading, keeps the dial open on
error, and closes after success. An empty action list remains a valid closed
control. Grid Layout ignores move and resize requests for locked tiles and
restores the pre-resize layout when Escape cancels a pointer resize.

These controls do not implement Angular Forms because they are actions and
layout composition rather than value controls.

## Keyboard and accessibility

Button remains a native button and exposes a hidden `progressbar` with current,
minimum, and maximum values. Speed Dial uses a named trigger, `aria-expanded`,
and `aria-controls`; Arrow keys, Home, and End move through enabled actions,
Escape closes, and focus returns to the trigger. Labels or tooltips name icon
actions.

Advanced Grid Layout tiles are focusable through the shared drag-drop
foundation. Use Alt+Arrow to move and Alt+Shift+Arrow to resize. Escape cancels
pointer resize and shared keyboard drag interactions. Do not make visual order
the only source of meaning, and announce persisted layout changes in the
application when they are important.

## Responsive, mobile, RTL, and reduced motion

Speed Dial uses logical fixed positions, mirrors horizontal linear direction in
RTL, and supports touch activation. Reserve enough container space for circular
actions. Grid Layout supports touch through shared drag-drop and named
responsive layouts. Its original `minItemWidth` mode remains the lowest-cost
mobile fallback. Both components remove transitions when the operating system
requests reduced motion.

## Theming and high contrast

The implementations use JRNG semantic color, border, radius, shadow, spacing,
and motion tokens in Default, Material, and Nexus presets. Progress outcome
colors use semantic success, danger, and neutral tokens. Visible focus uses the
shared focus ring. Verify application overrides in light, dark, system, and
forced-colors modes.

## SSR, hydration, and cleanup

Initial rendering does not access global browser objects. Speed Dial resolves
document direction only during interaction. Grid resize listeners are installed
from a pointer action and removed on completion, cancellation, or destruction.
Hydration starts from controlled inputs, so applications should provide the
same initial layout on server and client.

## Testing guidance

Test progress clamping, ARIA values, click blocking, cancellation, and every
outcome class. For Speed Dial, test controlled open state, disabled and async
actions, focus movement/restoration, outside click, Escape, RTL geometry,
reduced motion, and destroy cleanup. For Grid Layout, test basic projected mode,
controlled layout updates, collisions, compact reorder, bounds, locked items,
pointer and keyboard cancellation, responsive application, persistence, and
listener cleanup.

## FAQ

**Should Speed Dial replace a toolbar?** No. Use it for a small group of
contextual actions, especially where space is constrained.

**Does Grid Layout always install drag listeners?** No. Advanced behavior is
inactive until a controlled layout and the corresponding flags are supplied.

**Can progress exceed 100?** Input is safely clamped to the 0–100 range.

## Changelog

Introduced Speed Dial, determinate Button progress, and opt-in draggable,
resizable Grid Layout in the advanced feature expansion.
