# Changelog

## Unreleased

### Added

- Public project trust files, adoption documentation, compatibility guidance, and release checks.

### Changed

- Positioned JRNG UI for Angular admin panels, dashboards, and business applications.

### Fixed

- Documentation sections with unavailable details now show contextual guidance instead of empty tables.

### Deprecated

- No APIs are currently scheduled for deprecation.

### Removed

- No public APIs have been removed.

### Security

- Package validation rejects internal instruction, temporary, private, and test-output files.

### Migration notes

- No migration is required for the current documentation and developer-experience changes.

## 0.0.9

### Documentation and requested components

- Added the accessible `j-text-expand` component with character and responsive line truncation, two-way expanded state, projected content, custom labels, and reduced-motion support.
- Expanded Button with help and contrast intent, pill presentation, badges, loading labels, and configurable ripple while retaining the safe native button default.
- Added optional Avatar image zoom with pointer and keyboard activation, reusable preview overlay behavior, image fallback, Escape close, and focus restoration.
- Expanded Loader with spinner, dots, pulse, ring, dual-ring, bars, wave, bounce, orbit, typing, inline, overlay, fullscreen, and determinate presentations.
- Deprecated Metric Card for new work; dashboard metrics are now documented as compositions of Card, Badge, Progress, and chart components.
- Expanded every component page with usage boundaries, keyboard, responsive, template, limitation, related-component, and testing guidance.

### Table family

- Kept `j-table` and `j-tree-table` as separate public components with shared table contracts.
- Added strongly typed `JTableColumn<T>`, semantic column types, value getters, formatters, focused templates, and visual variants separated from density.
- Integrated no-data, no-results, error, skeleton, spinner, progress, and overlay states into `j-table`.
- Added Tree Table expansion, controlled expanded keys, lazy children, keyboard focus, tree-grid ARIA metadata, and propagated checkbox selection.
- Retained `j-column`, `j-table-empty-state`, and `j-table-skeleton` as deprecated compatibility APIs; no selector was removed.
- Added Table-family previews, copyable code, accessibility guidance, migration notes, and focused tests.

### Fixes

- Preserved and sanitized Editor values written before view initialization, including `ngModel`, Reactive Forms, resets, disabled updates, text mode, and HTML mode.
- Implemented locale-aware Input Number formatting/parsing, OTP placeholders and navigation, Combobox variants, File Upload custom-mode state, validation limits, and Table frozen rows.

### Accessibility

- Removed nested interactive controls from Select, Date Range Picker, Time Picker, and Tabs; clear and close actions now have separate semantic buttons and focus targets.
- Added OTP position labels, localized upload controls, accessible validation announcements, visible focus, RTL navigation, and reduced-motion configuration behavior.

### SSR

- Removed direct runtime browser-constructor checks from keyboard shortcuts, clipboard, menu, context-menu, theme, editor, and overlay paths.
- Added a representative Angular server-prerender and hydration build covering forms, Editor, Select, Menu, storage fallbacks, and optional entrypoint declarations.

### Forms

- Separated component-disabled and Forms API disabled sources in the updated controls so enabling one source cannot override the other.
- Prevented `writeValue` model emissions and retained programmatic values while controls are disabled.

### Overlays

- Added the shared `JAppendTo` target contract for local, body, element, and selector targets with global configuration, safe fallback, repositioning, z-index management, listener cleanup, and DOM restoration.

### Testing

- Added lifecycle/security/command Editor tests, locale Input Number tests, upload-mode and validation tests, overlay/config/SSR tests, and frozen-row behavior coverage.
- Added adjacent specification files for every canonical component, directive, pipe, and service, plus a CI verifier that rejects future public artifacts without tests.
- Added enforced statement, branch, function, and line coverage thresholds and direct interaction suites for Button, Avatar zoom, Image Preview, Avatar Group, Loader, Text Expand, Table, and Tree Table.
- Kept the normal full library, docs, and starter commands as required gates without forced process termination or skipped suites.

### Documentation

- Replaced stale Editor placeholder guidance and documented number formatting, upload modes, overlay targets, global configuration, SSR verification, Node requirements, and the 0.0.9 migration.
- Added generated beginner guidance and complete public input, output, and method coverage for every public component page, with focused file-backed demos for the primary additions.
- Added automated checks for demo file existence, non-empty code tabs, valid public selectors, and documentation/API registry consistency.
- Added mergeable Hindi and Gujarati locale examples.

### Tooling

- Added a real multi-job GitHub Actions workflow, Node 22.12 contributor default, aligned Angular SSR tooling, package-size reporting, and clean consumer verification.

### Package and release

- Kept an explicit runtime-file allowlist, source-map exclusion, forbidden-content scan, export/declaration verification, file-count limit, and separate packed/unpacked budgets.
- Release verification now detects missing Git metadata cleanly and includes all tests, builds, package, consumer, and SSR gates without publishing.

### Deprecated

- `JTimePickerComponent.timeOnly` is deprecated because Time Picker is inherently time-only; the compatibility input remains available.
- `JrngConfig.unstyled` remains a root styling hook but is deprecated as a promise to remove accessibility-critical component styles.

### Migration notes

- Existing form models remain numeric for Input Number and string/HTML for Editor. See `docs/migration-0.0.9.md` for upload-mode and sanitization details.

## 0.0.8

### Added

- Added cross-platform package-content verification, release validation, clean, and dist-only pack commands.
- Added a generated machine-readable inventory of all public components.
- Added typed disclosure, pagination, versioned storage, clipboard, media-query, keyboard-shortcut, timing, observer, live-announcement, and reduced-motion utilities.
- Added a versioned 126-component package registry and registry schema.

### Changed

- Added an explicit npm package file allowlist and public publish metadata.
- Added RxJS to the published peer dependency contract.
- Included the license and changelog in the npm package while excluding generated source maps.
- Added package size budgets, public-entrypoint validation, and forbidden-content checks.
- Added strict consumer compilation across every generated public entry point.
- Added typed global and component theme overrides plus semantic state, elevated-surface, icon-size, and major component tokens.
- Added validated, versioned table state restoration with typed recovery errors.
- Expanded `j-data-grid` with typed row/column helpers and pass-through events for table state, column controls, editing, expansion, export, and state restore errors.
- Improved tour lifecycle safety, missing-target handling, reduced-motion behavior, focus restoration, and typed error events.

### Fixed

- Excluded the divergent legacy source copy from authoritative lint and unit-test discovery.
- Updated the documentation shell test to assert the current public brand element.
- Removed circular root-barrel imports from the compatibility `image` and `column-filter` entry points.
- Removed template `$any` casts from transfer-list filter events and prefixed its internal selection-state class.
- Replaced runtime-generated Driver.js import code with a normal lazy import boundary.

### Security

- Added allowlist sanitization for editor values and pasted HTML, including safe URL protocol enforcement and removal of executable markup, event handlers, and unsafe embeds.

### Accessibility

- Added focus containment, deterministic accessible IDs, initial focus, focus restoration, and reference-counted body scroll locking to confirm dialogs.
- Added behavior tests for confirm-dialog labelling, keyboard focus, dismissal policies, and focus restoration.
- Added shared live-announcement and reduced-motion utilities.

### Performance

- Kept Chart.js and Driver.js behind optional lazy-loaded feature boundaries.

### Documentation

- Added release validation, tarball inspection, clean-consumer installation, and manual publishing guidance.
- Added generated searchable documentation records for every public component and coverage validation.
- Documented every supported chart type, the future CLI architecture, and the 0.0.8 migration path.

### Deprecated

- No APIs were newly deprecated in 0.0.8.

### Breaking Changes

- Editor output now removes unsupported or unsafe HTML. See `docs/migration-0.0.8.md` for the supported trust boundary.

## 0.0.6

### Breaking Changes

- Removed the legacy `clicked` and `jrPress` outputs from `j-button`.
- Use `onClick` for button activation.

Before:

```html
<j-button label="Save" (clicked)="save()"></j-button>
<j-button label="Save" (jrPress)="save()"></j-button>
```

After:

```html
<j-button label="Save" (onClick)="save()"></j-button>
```

### Changed

- Fixed duplicate clear icons for `j-input type="search"` by hiding native browser search cancel controls and keeping the JRNG clear button behavior.
- Polished `jRipple` with enable/disable input support, disabled host detection, reduced-motion handling, and CSS variables.
- Cleaned up component CSS variables and theme fallbacks across button, input, table, dialog, toast, drawer, skeleton, and related surfaces.
- Improved docs layout, navigation sections, component previews, and API tables.
- Added syntax-highlighted docs code blocks with copy feedback and language labels.
- Improved preview boxes with a softer grid canvas, border, radius, shadow, and responsive spacing.
- Expanded documentation for business utilities including metric cards, stat cards, status chips, page headers, and empty states.
- Expanded data table documentation for filtering, column management, export, state, sorting, pagination, selection, and table helper controls.
- Added optional Tour Guide support with `JTourService`, `jTourStep`, JRNG tour types, theme variables, and Driver.js loaded only when tours are used.

### Notes

- Tour Guide requires optional peer dependency `driver.js` in applications that use tours. Install it with `npm install driver.js`.
- No third-party UI-framework dependency is included.
