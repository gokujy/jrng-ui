# Portal, gesture, truncate and drag-drop foundations

## Overview and installation

Phase 1 adds independently implemented foundations at `jrng-ui/portal`, `jrng-ui/gesture`,
`jrng-ui/truncate`, and `jrng-ui/drag-drop`. Import only the declarations used by an application.
The live, independently owned example is available at `/guides/interaction-foundations`.

Portal exports `JPortalDirective`, `JPortalOutletDirective`, `JTemplatePortal`,
`JComponentPortal`, `JDomPortal`, `JPortalRef`, and `JPortalService`. Gesture exports
`JSwipeDirective`, `JPanDirective`, and `JZoomDirective`. Truncate exports
`JTruncateMiddleDirective`. Drag-drop exports `JDragDirective`, `JDropListDirective`,
`JDragHandleDirective`, `JDragPreviewDirective`, `JDragPlaceholderDirective`, and
`JDragBoundaryDirective`.

## Basic and advanced usage

Use a template portal for dynamic toolbars and app-shell extension areas, a component portal for
runtime overlay content, and a DOM portal only when existing DOM content must move temporarily.
Outlets support `attach`, `replace`, `detach`, and automatic destroy. A portal cannot be attached
twice. Separate outlets maintain independent references.

Gesture directives expose threshold, velocity, duration, axis, text-selection, scale, and disabled
inputs. Outputs contain pointer coordinates, deltas, velocity, direction, centre, scale delta,
source event, and cancellation phase. Consumers own all visual transforms.

Middle truncate accepts the source value through `jTruncateMiddle`. `mode="characters"` uses
`maxCharacters`, `leading`, `trailing`, `ellipsis`, and `preserveExtension`. `mode="width"` uses
the same preferences while measuring the host after resize. `recalculate()` is public. `showTitle`
retains the full value as a native tooltip.

Drop lists accept two-way-bound `data`, `connectedTo`, `orientation`, `sortingDisabled`,
`dropPredicate`, `disabled`, and `autoScroll`. Drags accept `data`, `axis`, `freeDrag`, `disabled`,
`dragLabel`, and `tabindex`. Outputs cover start, movement, cancellation, completion, list entry,
list exit, and drop. Preview, placeholder, handle, and boundary directives are optional templates
or markers.

## States, templates and asynchronous use

These foundations do not own loading, empty, error, read-only, or form state. Render those states
in the attached template or dragged content and set `disabled` while an asynchronous operation is
pending. Portal templates receive their supplied Angular context and injector. Drag preview and
placeholder templates are presentation hooks; application data changes only after an accepted
drop. Rejected and cancelled operations restore the source state.

## Keyboard and accessibility

Drag items use Control plus Arrow keys to reorder, Escape cancels pointer dragging, movement is
announced, and focus follows keyboard movement. Buttons, links, inputs, editable content, and text
selection do not start dragging. Essential gesture actions require visible named keyboard
alternatives. Truncated text keeps its complete accessible name. Disabled lists and items expose
`aria-disabled`. Custom previews must preserve semantic contrast and visible focus on the source.

## Responsive, mobile, RTL and reduced motion

Pointer Events unify mouse, touch, and stylus input. Swipe locks only after a dominant axis is
known so normal vertical scrolling remains available. Horizontal list orientation and logical
start/end application layouts work in RTL. No directive applies animation, allowing consumers to
honour `prefers-reduced-motion`. Touch targets for handles and gesture alternatives should remain
at least 44 CSS pixels.

## SSR, hydration and cleanup

DOM portal movement, Pointer Events, `ResizeObserver`, `MutationObserver`, animation frames, and
document listeners are browser guarded. Template and component portals preserve Angular
dependency injection, OnPush updates, and lifecycle destruction. Detach restores DOM portals.
Destroy removes views, component references, previews, placeholders, observers, captures, and
listeners. Stable server output is retained until browser measurement runs after hydration.

## Theming tokens

Use `--j-color-surface`, `--j-color-border`, `--j-color-text`, `--j-color-primary`,
`--j-focus-ring`, `--j-shadow-lg`, and `--j-motion-duration-fast` when styling consumer-owned
outlets, previews, placeholders, handles, and gesture surfaces. Verify Default, Material, and
Nexus presets in light, dark, system, and high-contrast modes.

## Testing guidance

Test duplicate portal attachment, replacement, DOM restoration, destroy idempotency, pointer
thresholds, direction and cancellation, axis locks, scale clamping, short and empty truncation,
resize recalculation, connected-list predicates, Escape cancellation, keyboard reorder, focus,
announcements, disabled state, interactive-child exclusion, SSR construction, and cleanup.

## FAQ

**Does zoom change CSS transforms?** No. It only emits scale data.

**Can one portal be displayed in two outlets?** Create two portal instances. A single attachment is
intentionally exclusive.

**Why did dragging not start?** A handle may be required, the item or list may be disabled, or the
pointer began on an interactive descendant.

**Does measured truncation preserve file extensions?** Yes, when `preserveExtension` is enabled.

## Changelog

Added in `0.1.1` as beta foundations. The APIs are tree-shakable secondary entrypoints and do not
depend on another UI library.
