# Overlay architecture

Popover is the canonical connected content overlay. Dialog is declarative; Dynamic Dialog is service-created. Drawer and Bottom Sheet retain distinct edge and mobile-sheet behavior.

Overlays share platform-guarded document listeners, stacking tokens, collision-aware placement, Escape and outside-click handling, and deterministic teardown. Modal overlays trap focus; connected overlays close safely on focus-out. Focus is restored to the opening element after close, and destroying a component removes every listener and overlay node.

Lifecycle outputs distinguish `open`/`opened` and `close`/`closed` only where both transition moments are observable and useful.
