# Component preview standard

This standard defines how JRNG UI documentation examples are designed, implemented, reviewed, and kept aligned with public APIs.

## Example order

Examples progress from the smallest useful workflow to advanced and contextual behavior:

1. Basic
2. Variants
3. Sizes
4. States
5. Events
6. Forms
7. Templates
8. Programmatic Control
9. Advanced Features
10. Responsive
11. RTL
12. Accessibility

Only include an item when the component supports a meaningful example. Use descriptive titles such as `Loading`, `Reactive Forms`, `Custom Template`, and `Virtual Scroll`. Do not use numbered, test, demo, other, all-features, or complete-example titles.

## Basic examples

Basic is first and demonstrates the component's primary purpose with the fewest inputs needed for a useful result. It must not combine filtering, sorting, editing, selection, expansion, server loading, or other independent capabilities merely to make the preview look comprehensive.

A non-interactive component may have fewer examples when Basic plus one focused state or variant covers every meaningful API.

## Focused examples

One example explains one concept or a small group of inseparable APIs. Split examples when a reader would need to understand two independent state machines or workflows at once. Large components should build progressively; an advanced example may assume the reader understands Basic, but its preview and source must still run independently.

Every card contains:

- a clear title;
- a one-sentence description;
- a focused live preview;
- an HTML source tab;
- a TypeScript source tab;
- an SCSS tab only when custom styling is genuinely required;
- a copy-code action; and
- correct modular `jrng-ui/*` imports.

## Independent state

Every example owns its data arrays, filters, sorting, pagination, selection, signals, form controls, loading/error state, expansion state, bound properties, and event log. Do not share a `FormGroup`, mutable collection, signal, or reset method between cards.

Reusable immutable type definitions and pure fixture factories are allowed. Each card must call the factory or create its own immutable value so a user interaction cannot affect another card.

Overlay examples own cleanup and restore focus to their trigger. Async examples cancel subscriptions, timers, and pending work on teardown.

## Preview and source accuracy

Displayed HTML, TypeScript, and optional SCSS must reproduce the rendered preview exactly. Imports use public modular entry points, buttons use `(onClick)`, and selectors/classes follow `j-`/`.j-*`. Documentation-only classes use `.j-docs-*`.

File-backed demos generate source tabs from their real files. Metadata-driven previews must be compiled and validated against the built public registry. Copy metadata must identify the same example and language shown in the active tab.

## Naming and content

Use fictional customer-related business data: customer IDs, names, companies, email addresses, phone numbers, account managers, industries, locations, account types, subscriptions, statuses, dates, orders, support cases, balances, renewals, and segments.

Never use private data, real people or companies, BDMS terminology, internal workflows, or removed selectors. `j-table` owns data-grid behavior, `j-tree-table` owns hierarchical table behavior, `j-editor` owns rich text, `j-file-browser` owns file management, and `j-file-preview` owns preview-only document behavior.

## Accessibility

Examples preserve semantic structure, visible focus, accessible names, disabled behavior, contrast, and keyboard operation. Dynamic results use an appropriate live region. Overlay examples demonstrate Escape, initial focus, focus containment where modal, and focus restoration. Decorative content is hidden from assistive technology.

Accessibility examples document the relevant keyboard commands and ARIA relationships; they do not substitute prose for working behavior.

## Responsive and RTL

Responsive examples use the smallest realistic dataset and demonstrate wrapping, scrolling, or stacking at mobile, tablet, and desktop widths. They avoid fixed dimensions unless the API being explained requires them.

RTL examples set direction on the example boundary so they do not alter other cards. Logical CSS properties are preferred. Keyboard behavior follows visual direction only where the component contract requires it.

## Themes

All previews use JRNG semantic theme tokens and work in Default, Material, and Nexus presets under light and dark modes. Avoid hardcoded semantic colors in documentation SCSS. Overlays inherit the active documentation theme. Respect `prefers-reduced-motion` for non-essential movement.

## API coverage

The generated coverage inventory maps every meaningful public input, output, two-way binding, consumer method, template directive, and supported forms integration to runnable examples. Generated metadata is a tracking aid, not proof of usable documentation.

Review the actual component source and built declarations. An API may be excluded only with a written reason, such as a framework lifecycle method, ControlValueAccessor hook, internal template helper, or generic styling hook already covered by the theming guide. Unsupported and nonexistent APIs must not be documented.

## Complex components

Tables, trees, editors, schedulers, charts, file tools, query builders, and other advanced components require:

- a small Basic example;
- separate data, state, events, forms, templates, programmatic, performance, responsive, RTL, and accessibility examples where supported;
- normal, loading, empty, filtered-empty, and error states where meaningful;
- realistic but compact fictional customer scenarios; and
- independent sorting, filtering, pagination, selection, expansion, editing, and async state.

Large datasets are reserved for virtualization and performance examples. Server examples clearly distinguish local simulation from a real network integration.

## Review checklist

Before handoff, verify the rendered preview, every source tab, copy action, modular imports, state isolation, keyboard flow, focus restoration, responsive layout, RTL, reduced motion, all six preset/mode combinations, route/navigation/search metadata, API mapping, focused tests, docs build, lint, package verification, public API checks, and SSR behavior as applicable.
