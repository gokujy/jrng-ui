# JRNG UI Advanced Components Roadmap

## Purpose

This roadmap records researched advanced-component **candidates**. Inclusion is not an implementation commitment. A candidate advances only through an explicit design and implementation decision, with repository readiness, accessibility, testing, documentation, bundle, SSR, and maintenance evidence.

Allowed statuses are:

- **Candidate** — plausible responsibility; demand and design are not approved.
- **Approved for design** — technical/API design may proceed, but source implementation may not.
- **Approved for implementation** — included in the current bounded implementation batch.
- **Deferred** — intentionally postponed until named foundations, demand, or capacity exist.
- **Research only** — feasibility or product-boundary research may continue; no implementation is planned.
- **Rejected** — conflicts with JRNG ownership, maintenance, dependency, or duplication policy.
- **Implemented** — source, tests, documentation, exports, and package validation are complete.

Generated inventory fields such as `tests: true` describe discovered repository metadata. They do not prove a command currently passes. Only executed validation recorded in baseline or completion reports establishes a passing result.

## Phase 0 stabilisation gate

Before any new advanced component is implemented:

1. Record repository state, toolchain, public count, existing advanced owners, removed selectors, and unrelated changes.
2. Execute available library build, tests, lint, documentation, package, and public-registry checks.
3. Separate pre-existing, introduced, environment-dependent, and credential/service failures.
4. Confirm `j-data-grid` remains absent.
5. Commit the baseline independently.

The current gate is recorded in `advanced-components-baseline.md`.

## Candidate register

| Candidate              | Selector direction  | Priority             | Status              | Decision                                                                                                        |
| ---------------------- | ------------------- | -------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Query Builder          | `j-query-builder`   | P0                   | Implemented         | Delivered with a neutral typed Boolean-expression model, tests, docs, exports, and package validation.          |
| Cron Expression Editor | `j-cron-expression` | P1                   | Implemented         | Delivered with Linux five-field parsing, forms integration, tests, docs, exports, and package validation.       |
| Barcode                | `j-barcode`         | P1                   | Implemented         | Delivered with deterministic QR, Code 128 B, and EAN-13 SVG, tests, docs, exports, and package validation.      |
| Chat                   | `j-chat`            | P1                   | Candidate           | Valuable transport-neutral UI, but feed virtualisation/live collaboration needs a separate design.              |
| Pivot Table            | `j-pivot-table`     | P1 after foundations | Deferred            | Requires aggregation, two-axis navigation/virtualisation, and field-chooser foundations.                        |
| Diagram                | `j-diagram`         | P2                   | Deferred            | Requires geometry, selection, command history, SVG accessibility, and performance budgets.                      |
| Map                    | `j-map`             | P2 / demand-based    | Candidate           | Provider adapters, licensing, SSR, offline behavior, and bundle policy require demand evidence.                 |
| Ribbon                 | `j-ribbon`          | P2                   | Approved for design | May become a command-surface foundation; must not pre-empt a consumer-driven API.                               |
| Code Editor            | `j-code-editor`     | P2 / adapter-based   | Approved for design | Core owns the Angular shell and contract; editing engines must be optional adapters.                            |
| Dock Manager           | `j-dock-manager`    | P3                   | Deferred            | Depends on mature drag, resize, persistence, focus, and layout primitives.                                      |
| Spreadsheet            | `j-spreadsheet`     | P3                   | Deferred            | Very high correctness/accessibility scope; needs formula, selection, clipboard, and virtualisation foundations. |
| Image Editor           | `j-image-editor`    | P3                   | Deferred            | Requires canvas/SVG rendering, history, export, gesture, and memory design.                                     |
| Block Editor           | `j-block-editor`    | P3 / research        | Research only       | Structured editing and schema boundaries need feasibility research and demand.                                  |
| Document Editor        | `j-document-editor` | research only        | Research only       | Pagination, document formats, collaboration, and conversion are not approved product commitments.               |

Exactly Query Builder, Cron Expression Editor, and Barcode were approved and are now implemented in the completed batch. No other candidate began source implementation.

## Current implementation order

### Batch 1 — implemented sequentially

1. Query Builder (P0)
2. Cron Expression Editor (P1)
3. Barcode (P1)

The completed checklists are in `advanced-components-phase-1.md`; integrated evidence is in `advanced-components-phase-1-completion.md`.

### Later decision gates

1. Reassess Chat demand and Pivot Table foundations.
2. Complete a design review for Ribbon and adapter-based Code Editor only when a real consumer is ready.
3. Reassess Diagram and Map after geometry/provider boundaries and budgets are documented.
4. Keep Dock Manager, Spreadsheet, and Image Editor deferred.
5. Keep Block Editor and Document Editor at research-only status unless a separate roadmap approval changes them.

This order supersedes earlier “top five” or multi-phase lists. Candidate priority is not implementation approval.

## Candidate responsibility summaries

### Query Builder

- Authors a versionable, JSON-safe, backend-neutral Boolean-expression tree.
- Supports typed field/operator metadata, nested AND/OR groups, immutable edits, recovery validation, templates, and forms integration.
- Does not execute a query, connect to data, emit SQL by default, or replace simple Filter Bar use cases.
- First-release risk: recursive identity, malformed persisted models, focus restoration, and type/operator transitions.

### Cron Expression Editor

- Parses, validates, normalises, describes, and authors a documented Linux cron grammar.
- Supports raw and structured editing with predictable CVA behavior and bounded previews.
- Does not schedule or execute work and does not imply Quartz/Spring compatibility.
- First-release risk: preserving invalid input, dialect semantics, impossible schedules, and token-order behavior in RTL UI.

### Barcode

- Deterministically renders validated QR Code, Code 128, and EAN-13 data to a single accessible SVG.
- Provides stable SSR markup, quiet-zone/contrast validation, visible decoded text, and SVG export.
- Does not scan, access cameras, use barcode fonts, or manage inventory.
- First-release risk: encoder conformance, SVG size, contrast/quiet-zone guidance, and browser-only export capabilities.

### Chat

- Candidate transport-neutral conversation/feed surface with message state, virtualisation, live announcements, and extension templates.
- Does not own sockets, persistence, AI inference, identity, moderation, or uploads.
- Requires an explicit data/transport contract and large-history accessibility design before approval.

### Pivot Table

- Candidate multidimensional aggregation and pivot presentation distinct from Table.
- Field Chooser belongs to Pivot Table, not a separate public component.
- Requires deterministic aggregation, two-axis navigation/virtualisation, export policy, and worker thresholds.

### Diagram

- Candidate spatial node/connector editor with accessible companion structure.
- Requires original geometry/selection/history architecture and no vendor object pass-through.
- BPMN/UML packs and collaboration remain later optional work.

### Map

- Candidate provider-neutral operational map surface.
- Provider SDKs, keys, geocoding, routing, offline tiles, and licensing remain application/adapter responsibilities.
- Must have SSR fallback and accessible non-map data representation.

### Ribbon

- Candidate command surface, not an Office-clone commitment.
- Commands must come from an application-owned registry; keyboard, overflow, reduced motion, and responsive collapse are release gates.

### Code Editor

- Candidate accessible Angular wrapper with an engine-neutral value/language/options contract.
- Mature editing engines remain optional peer adapters; no large engine enters the base bundle.

### Dock Manager

- Candidate resizable/dockable workspace composition.
- Floating windows, auto-hide, and cross-window behavior are not initial commitments.

### Spreadsheet

- Candidate workbook/grid authoring product, not an alias for Data Grid.
- Requires a separate formula/security/file-format plan and must never execute arbitrary JavaScript.

### Image Editor

- Candidate non-destructive raster/annotation editor with bounded history and export.
- Does not replace Image display or File Preview.

### Block Editor

- Research-only structured block authoring.
- Rich-text features that fit the existing responsibility remain in `j-editor`.

### Document Editor

- Research-only structured paginated authoring feasibility.
- No DOCX/PDF parity, conversion service, or collaborative editing commitment exists.

## Ownership decisions that remain fixed

- Never reintroduce `j-data-grid` or a renamed equivalent.
- Enterprise table features belong to `j-table`.
- Hierarchical grid features belong to `j-tree-table`.
- File-management features belong to `j-file-browser`.
- View-only PDF support belongs to `j-file-preview`.
- Chart visualisations belong to `j-chart` when they fit its visualisation responsibility.
- Dashboard panel layout belongs to `j-grid-layout`.
- Pivot Field Chooser belongs to Pivot Table.
- Rich-text features belong to `j-editor`.
- Task-board behavior belongs to `j-kanban`; organisation-chart-only behavior belongs to `j-org-chart`.

## Shared architecture policy

- Build every public feature as a standalone, modular `jrng-ui/*` entry point.
- Implement the minimum private utility required by the active component. Extract an internal shared primitive only after proven reuse; do not expose it publicly merely because one component needs it.
- Use existing JRNG controls and core accessibility/browser utilities where they keep dependencies and behavior coherent.
- Keep optional engines/codecs/providers out of the mandatory bundle and document licences, maintenance, SSR, and size before adoption.
- Guard browser APIs, publish explicit state changes compatible with zoneless Angular, use logical CSS, and preserve token order where a domain grammar is direction-neutral.
- All persisted public state must be versionable and JSON-safe; functions, templates, DOM/engine/provider objects, and secrets are not persisted.
- Disabled state blocks pointer, keyboard, and public programmatic actions where applicable. Read-only state prevents mutation while retaining understandable navigation and selection.

## Validation gates

Every implemented candidate requires:

- Focused model/parser/encoder and component tests.
- Keyboard, focus restoration, ARIA/error association, RTL, responsive, SSR, cleanup, disabled/read-only, and forms tests where applicable.
- Independent documentation examples whose preview and displayed source match.
- Modular exports and package entry-point verification.
- Generated inventory/registry produced by repository scripts without falsified status.
- Library and docs builds, full relevant tests, lint, registry/API/package checks, SSR checks, and package dry run.
- Bundle/dependency review and confirmation that no reference source, tests, CSS, structure, assets, or documentation were copied.

## Non-goals and rejected standalone responsibilities

The following are rejected as separate JRNG public components under the current ownership model:

- Data Grid or enterprise-grid aliases.
- Hierarchical Grid separate from Tree Table.
- Dashboard Designer separate from Grid Layout.
- Pivot Field Chooser separate from Pivot Table.
- PDF Viewer separate from File Preview.
- File Manager separate from File Browser.
- Task Board separate from Kanban.
- Heatmap, Treemap, Gauge, Sankey, Funnel, or Range Selector when they fit Chart.
- Rich Text Editor separate from Editor.
- Organisation-chart-only Diagram separate from Org Chart.

No advanced UI component owns backend execution, credentials, scheduling services, provider accounts, persistence backends, chat transport, arbitrary code/formula execution, or document conversion.
