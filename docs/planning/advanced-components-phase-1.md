# JRNG UI Advanced Components — Phase 1

## 1. Objective

Phase 1 delivers three bounded advanced components sequentially:

1. Query Builder
2. Cron Expression Editor
3. Barcode

Each component receives its own architecture, source, tests, documentation, generated inventory, validation, and commit before the next component begins.

## 2. Selection rationale

These components provide useful enterprise capabilities without first committing JRNG to the Very High complexity of a spreadsheet, document editor, dock manager, image editor, or full diagram engine.

- Query Builder validates typed metadata, immutable domain state, nested keyboard interaction, forms integration, and recoverable persistence.
- Cron Expression Editor validates a small original grammar, raw/structured state reconciliation, bounded calculation, and scalar CVA behavior.
- Barcode validates deterministic SVG generation, conformance fixtures, SSR rendering, export boundaries, and compact algorithmic code.

Together they exercise the repository's modular packaging and quality gates while keeping backend execution, provider SDKs, and large optional engines out of the library.

## 3. Explicit exclusions

The following candidates are not part of this implementation batch:

- Chat — remains a P1 candidate pending transport/feed design.
- Pivot Table — deferred until aggregation, selection, navigation, and virtualisation foundations are approved.
- Diagram — deferred pending geometry/history/accessibility design.
- Map — candidate subject to demand, provider, licensing, SSR, and bundle evidence.
- Ribbon — design may proceed later; no source implementation in this batch.
- Code Editor — design-only and adapter-based; no engine or wrapper implementation here.
- Dock Manager, Spreadsheet, and Image Editor — deferred Very High complexity products.
- Block Editor and Document Editor — research only.

No excluded component, renamed equivalent, or speculative shared public primitive may be started as part of Phase 1.

## 4. Repository readiness

### Query Builder

- **Reuse:** Input, Input Number, Checkbox, Select, Date Picker, Button, core stable IDs, ARIA helpers, focus helpers, and live announcer patterns.
- **Missing internal work:** private expression types, immutable tree operations, cycle-safe normalisation, field/operator compatibility, validation, and stable-ID reconciliation.
- **Relevant existing components:** Filter Bar remains the simple-filter owner; Table and Tree Table only consume expressions if an application chooses.
- **Theming:** component-level builder/group/condition/error/focus tokens over semantic surface, border, muted, primary, danger, spacing, and radius tokens.
- **SSR:** no browser globals for model/render; focus restoration must guard the DOM.
- **Zoneless:** signal/computed state and explicit immutable event/CVA updates.
- **Accessibility:** named builder/groups, explicit conjunction meaning, linear DOM order, labelled controls/errors, live mutation announcements, and deterministic post-delete focus.
- **Bundle:** no query execution or serializer package; reuse only tree-shakable Angular/JRNG entry points.
- **Optional dependencies:** none.

### Cron Expression Editor

- **Reuse:** Input, Select, Button/Copy Button patterns, validation styles, CVA conventions, core clipboard and live-announcement patterns.
- **Missing internal work:** private Linux cron grammar, parser, formatter, validation, description generator, shortcut model, and bounded next-run search.
- **Relevant existing components:** Calendar Scheduler displays schedules but does not author cron; it gains no cron service.
- **Theming:** editor/unit/raw/preview/error/focus tokens over semantic form tokens.
- **SSR:** parser/formatter are pure; clipboard actions and focus use guarded browser services.
- **Zoneless:** explicit raw/structured transitions, signals, and synchronous CVA/validation publication.
- **Accessibility:** labelled time-unit groups, symbol explanations, associated errors, polite previews, and accessible shortcut names.
- **Bundle:** a small original parser; no scheduler or date engine.
- **Optional dependencies:** none.

### Barcode

- **Reuse:** semantic tokens, Button/Copy/Download patterns where actions are exposed, core download/browser abstractions, and component accessibility conventions.
- **Missing internal work:** private QR, Code 128, and EAN-13 encoders; validation; module-to-path SVG renderer; contrast checking; deterministic export text.
- **Relevant existing components:** Image remains display-oriented and File Preview remains file-oriented; neither owns encoding.
- **Theming:** foreground/background/caption/invalid/focus tokens while keeping explicit scan colors configurable.
- **SSR:** pure deterministic SVG output; PNG/canvas work is excluded unless a guarded lightweight path proves safe.
- **Zoneless:** computed encoding/render state and explicit ready/invalid events without layout observers.
- **Accessibility:** one named graphic, hidden SVG internals, separate caption, associated invalid description, and clear export action name.
- **Bundle:** compact encoders and one SVG path, never one Angular view per module; no large barcode suite.
- **Optional dependencies:** none planned; an external encoder would require documented licence, maintenance, size, and SSR review before adoption.

## 5. Component order

1. Query Builder
2. Cron Expression Editor
3. Barcode

The order is a hard sequencing constraint for implementation and commits.

## 6. Shared implementation policy

Internal utilities are implemented only when required by the active component. A utility is extracted only after real reuse is proven. The first consumer keeps the smallest viable private implementation; no public primitive is created solely to anticipate later candidates.

All implementation is original JRNG architecture and code. Reference projects may inform behavior and edge cases only.

## 7. Component milestone checklists

### Query Builder

#### Architecture

- [ ] Original versionable, JSON-safe Boolean-expression types defined.
- [ ] Pure immutable add/remove/duplicate/update/normalise/validate operations tested separately.
- [ ] Stable IDs survive controlled updates; cycles and malformed persisted data cannot crash rendering.
- [ ] Field types and operator arity drive compatible editors without query execution or SQL generation.
- [ ] CVA/controlled-value contract, public methods, disabled, and read-only semantics documented.

#### Implementation

- [ ] Root and nested AND/OR groups, conditions, empty/error states, and recovery UI implemented.
- [ ] Text, number, boolean, date, single, range, list, and no-value operators implemented.
- [ ] Add/remove/duplicate actions publish immutable state and restore focus.
- [ ] Field, value-editor, group-header, and empty-state templates implemented.
- [ ] Responsive stack, logical RTL CSS, theme tokens, keyboard behavior, labels/errors, and announcements implemented.

#### Testing

- [ ] Model operations, nesting, identity, cycles, serialisation, validation, unknown metadata, field/operator transitions, and large trees pass.
- [ ] Forms, templates, disabled/read-only, keyboard/focus, RTL/responsive markers, SSR, and cleanup pass.
- [ ] Focused tests, full relevant suite, lint, library/docs builds, API/registry/package/SSR checks pass.

#### Documentation and packaging

- [ ] Modular entry point and public exports work.
- [ ] Registry, navigation, generated inventory, and removed-selector guards remain correct.
- [ ] Independent examples cover basic, nested, customer, audit, types, custom operator/editor, controlled/forms, states, validation, responsive/RTL, accessibility/keyboard, theming, API, testing, FAQ, and changelog.
- [ ] Preview and displayed source match; no unsafe SQL example exists.

### Cron Expression Editor

#### Architecture

- [ ] Exact Linux five-field grammar and day-of-month/day-of-week rule documented.
- [ ] Pure grammar/parser/formatter/validator/description functions tested separately.
- [ ] Invalid raw input remains visible; normalised CVA value and structured state transitions are predictable.
- [ ] Preview calculation has strict iteration/time bounds and impossible schedules terminate.

#### Implementation

- [ ] Raw input plus minute/hour/day-of-month/month/day-of-week structured controls implemented.
- [ ] Wildcard, single, range, list, step, and common shortcuts implemented.
- [ ] Normalisation, validation, human description, bounded next-run preview, copy, CVA, disabled/read-only, and errors implemented.
- [ ] Responsive/RTL UI preserves cron token order and exposes complete keyboard/ARIA/focus behavior and theme tokens.

#### Testing

- [ ] Valid/invalid grammar, bounds, wildcard/list/range/step, whitespace, round trips, dialect semantics, impossible schedules, and termination pass.
- [ ] CVA/Reactive Forms, disabled/read-only, keyboard, RTL, SSR, invalid recovery, and cleanup pass.
- [ ] Focused tests, full relevant suite, lint, library/docs builds, API/registry/package/SSR checks pass.

#### Documentation and packaging

- [ ] Selector is exactly `j-cron-expression`; modular entry point and exports work.
- [ ] Registry/navigation/inventory updates are generated and removed selectors remain guarded.
- [ ] Independent examples cover basic, recurring minutes, nightly, weekday, monthly, structured/raw, recovery, forms/states, responsive/RTL, accessibility/keyboard, theming, supported/unsupported grammar, API, testing, FAQ, and changelog.
- [ ] Documentation states that applications execute jobs and makes no Quartz/Spring claim.

### Barcode

#### Architecture

- [ ] QR Code, Code 128, and EAN-13 encoders have original private APIs and conformance fixtures.
- [ ] Equal inputs produce stable encoding and stable SVG path/markup.
- [ ] Validation covers value limits, characters, EAN checksum, dimensions, quiet zone, and contrast.
- [ ] Browser-only export behavior is guarded; SVG rendering itself is pure and SSR-safe.

#### Implementation

- [ ] `value`, `symbology`, dimensions/size, quiet zone, colors, QR correction, visible text, accessible label, and invalid/ready behavior implemented.
- [ ] One accessible SVG graphic is emitted; module internals are hidden and not individually focusable.
- [ ] Responsive/print/RTL-safe styling preserves encoded order and quiet zones.
- [ ] SVG export and disabled export action state implemented; PNG remains excluded unless proven lightweight.
- [ ] Component tokens and `.j-*` classes implemented.

#### Testing

- [ ] Determinism and trusted QR, Code 128, and EAN-13 vectors/checksums pass.
- [ ] Invalid/empty/oversized values, quiet zone, contrast, dimensions, repeated changes, export, SSR, responsive/RTL markers, memory, and cleanup pass.
- [ ] Focused tests, full relevant suite, lint, library/docs builds, API/registry/package/SSR checks pass.

#### Documentation and packaging

- [ ] Selector is exactly `j-barcode`; modular entry point and exports work.
- [ ] Registry/navigation/inventory updates are generated and removed selectors remain guarded.
- [ ] Independent examples cover QR, inventory Code 128, retail EAN-13, URL/ticket, sizing, caption, colors, invalid, print, export, accessibility, responsive/RTL, theming, API, scanner testing, FAQ, and changelog.
- [ ] Scanning risks and manual physical-scanner validation steps are documented without hardware-dependent automation.

## 8. Definition of done

A component is complete only when:

- Source implementation is complete.
- Selector and classes follow JRNG conventions.
- Public exports are complete.
- Package entry points work.
- Build passes.
- Tests pass.
- Keyboard operation is complete.
- Accessibility is verified.
- RTL is tested.
- Responsive behavior is tested.
- SSR is safe.
- Zoneless operation is considered.
- Disabled/read-only states work.
- Documentation is complete.
- Documentation examples are independent.
- Preview and code match.
- No unrelated regressions remain.
- No forbidden source copying occurred.

Phase 1 itself is complete only after all three component commits and a final integrated validation/completion commit.
