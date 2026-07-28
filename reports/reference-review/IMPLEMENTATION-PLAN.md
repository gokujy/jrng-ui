# Implementation plan

## Principles

- References remain read-only concept sources; all JRNG code is independently designed.
- Preserve selectors, CSS naming, tokens, modular entrypoints, and compatible public APIs.
- Fix shared foundations before component workarounds.
- A component can move from beta to stable only after implementation, accessibility, docs, tests, and packaged output are all reviewed.

## Phase 0 — baseline and evidence

1. Preserve the clean-worktree baseline and record actual command results.
2. Generate inventories from public registries and source APIs.
3. Run lint, API/registry/spec gates, library tests, docs audit, SSR, docs build, package verification, and dry pack.
4. Track every failure in `STABILITY-ISSUES.md`.

## Phase 1 — critical shared foundations

1. Fix Splitter listener/subscription cleanup and owning-window/storage access.
2. Exercise overlay position, stack, outside click, escape arbitration, z-index, focus trap, scroll lock, append-to, and restoration with multi-instance tests.
3. Audit timers, observers, global listeners, and subscriptions for destroy cleanup.
4. Verify SSR/hydration safety and reduced motion.

Dependencies: none. Breaking risk: low if changes remain internal. Migration: none expected.

## Phase 2 — high-priority form controls

1. Establish reusable CVA conformance tests: write/reset/patch, touched, disabled, invalid value, dynamic options.
2. Stabilize Select, MultiSelect, Autocomplete, Date Picker, Time Picker, Editor, Listbox, Input Number, and composite choice controls.
3. Verify reactive and template-driven forms examples with independent state.

Dependencies: Phase 1 overlays and focus. Breaking risk: medium around event timing and invalid-value normalization; retain compatibility and document intentional corrections.

## Phase 3 — navigation and composites

1. Stabilize Menu, Context Menu, Tiered Menu, Mega Menu, Tabs, Accordion, Stepper, Command Palette, Toolbar, Topbar, and Sidebar Nav.
2. Add roving tabindex, typeahead, Home/End, RTL arrows, disabled-item skipping, escape hierarchy, and focus restoration tests as applicable.

Dependencies: Phase 1. Breaking risk: low to medium for corrected keyboard behavior.

## Phase 4 — data components

1. Review Table scenario-by-scenario without recreating the removed Data Grid.
2. Stabilize Tree, Tree Table, Paginator, Virtual Scroller, Data View, Transfer/Order lists, Kanban, Gantt, and scheduler behavior.
3. Validate large/dynamic data, lazy errors, selection invariants, persistence, responsiveness, and keyboard navigation.

Dependencies: Phases 1–3. Breaking risk: medium for selection and sorting event contracts; add regression tests before changes.

## Phase 5 — feedback, layout, media, and files

1. Stabilize dialogs/drawers/toasts, Splitter/layout, Carousel/Gallery/Image/Chart, and file workflows.
2. Add loading, empty, error, unsupported, retry, progress, abort, and cleanup cases.
3. Measure repeated lifecycle and large-content scenarios before optimizing.

Dependencies: Phase 1; forms where controls are embedded. Breaking risk: low.

## Phase 6 — documentation completion

1. Repair the preview registry architecture, then add accurate live previews in controlled category batches.
2. Require breadcrumb, title, description, exact preview/source parity, copy, imports, examples, API, accessibility, keyboard, theming, testing, and useful FAQ/changelog notes.
3. Ensure independent state and realistic disabled/loading/empty/invalid/error/responsive/form examples.

Dependencies: implementation phase for each component. Breaking risk: none. Packaging rule: reports and docs must remain excluded from npm output.

## Phase 7 — release validation

Run install, formatting check, lint, focused/full tests, E2E if configured, library/docs/SSR builds, registries, strict API consumer, package verifier, dry pack, and package-content inspection. Search output for reference dependencies/naming and local absolute paths.

## Execution status

All phases in this production-readiness pass are complete. Critical/high findings discovered during the pass were fixed in controlled infrastructure, forms, navigation, data, feedback/overlay, layout, and media/file groups, with a lint/test/build gate after each group. The final release matrix passes. Remaining beta-component items in the gap matrix are explicitly retained as future depth/feature work and are not claims of stability.

Recommended versioning rule: remain `0.1.x` while most components are beta; use a patch release for compatible stabilization. Do not recommend 1.0 until every component claimed stable passes all five evidence dimensions.
