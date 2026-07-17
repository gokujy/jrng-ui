# Design variants in v0.0.9

This release adds opt-in presentation concepts without changing any existing default, selector,
event, behavior, or modular import. A variant changes content hierarchy or layout; size, density,
semantic color, surface appearance, loading, disabled, selection, and other behavior remain separate.

## Design review

The implementation was evaluated against established interaction, accessibility,
responsive-layout, and API-design practices. JRNG UI keeps its own Angular-first signals,
selectors, events, tokens, examples, documentation, and visual language.

The review produced four rules:

- Preserve behavior and ARIA semantics across visual concepts.
- Keep orientation, size, density, severity, appearance, and state out of `variant`.
- Prefer a few complete presets over combinatorial low-level styling inputs.
- Keep the existing default byte-for-byte compatible in intent and make every new preset opt-in.

## Added variants

| Component    | Variants                             | Recommended use                                                          |
| ------------ | ------------------------------------ | ------------------------------------------------------------------------ |
| Accordion    | `default`, `separated`, `minimal`    | Grouped disclosures, independent settings, or low-weight content rows.   |
| Breadcrumb   | `default`, `contained`, `steps`      | Page hierarchy, a distinct trail region, or a short setup path.          |
| Empty State  | `default`, `inline`, `panel`         | Full empty regions, table/result gaps, or first-run prompts.             |
| Page Header  | `default`, `stacked`, `centered`     | Admin pages, action-heavy pages, or focused landing/onboarding pages.    |
| Paginator    | `default`, `simple`                  | Direct page access or a narrow previous/next reading flow.               |
| Progress Bar | `default`, `segmented`, `labeled`    | General progress, checkpoint work, or always-visible percentage context. |
| Stepper      | `default`, `rail`, `progress`        | Descriptive cards, connected wizards, or compact in-context progression. |
| Tabs         | `default`, `pills`, `segmented`      | Content sections, lightweight categories, or a small view switch.        |
| Timeline     | `default`, `activity`, `alternating` | Milestones, dense audit activity, or editorial histories.                |

`compact`, `linear`, `multiple`, `indeterminate`, `disabled`, `orientation`, and semantic severity
remain independent inputs. File Upload retains its established `mode="basic | advanced"` API because
that already represents its two presentation concepts; adding a synonymous `variant` would create
conflicting controls.

## Complete component suitability audit

Every public component in the generated v0.0.9 inventory was reviewed. The entries below did not
receive a new variant in this phase. The category note explains the shared reason; existing public
presentation APIs remain supported.

### Buttons and actions

`j-button`, `j-copy-button` — their useful differences are action emphasis, appearance, severity,
size, loading, or copied state. The existing button API already covers these concerns.

### Data and tables

`j-action-menu`, `j-column`, `j-column-filter`, `j-data-grid`, `j-data-view`, `j-filter-bar`,
`j-order-list`, `j-pick-list`, `j-sort-icon`, `j-table`, `j-table-empty-state`, `j-table-skeleton`,
`j-transfer-list`, `j-tree`, `j-tree-table`, `j-virtual-scroller` — alternate concepts would require
different data contracts, templates, virtualization, selection behavior, or responsive policy.
`j-paginator` is the sole component in this category receiving a presentation-only variant.

### Data display

`j-avatar`, `j-avatar-group`, `j-badge`, `j-card`, `j-chip`, `j-divider`, `j-icon`, `j-loader`,
`j-meter-group`, `j-metric-card`, `j-progress-spinner`, `j-skeleton`, `j-stat-card`, `j-status-chip`,
`j-tag` — the remaining axes are shape, semantic intent, size, loading shape, or surface appearance.
Card's existing legacy variants are preserved, but no additional surface-only variants were added.
`j-empty-state` and `j-progress-bar` receive layout or indicator concepts.

### Forms and inputs

`j-autocomplete`, `j-calendar`, `j-checkbox`, `j-chips`, `j-color-picker`, `j-combobox`,
`j-date-picker`, `j-date-range-picker`, `j-editor`, `j-float-label`, `j-form-field`, `j-icon-field`,
`j-ifta-label`, `j-input`, `j-input-group`, `j-input-icon`, `j-input-mask`, `j-input-number`,
`j-input-otp`, `j-knob`, `j-listbox`, `j-multiselect`, `j-password`, `j-radio`, `j-radio-group`,
`j-rating`, `j-select`, `j-select-button`, `j-slider`, `j-switch`, `j-textarea`, `j-time-picker`,
`j-toggle-button` — differences are input appearance, label placement primitives, value shape,
selection behavior, or physical size. Adding presentation concepts would duplicate existing controls
or change the interaction model.

### Layout

`j-app-shell`, `j-auth-layout`, `j-container`, `j-dashboard-layout`, `j-fieldset`, `j-grid-layout`,
`j-panel`, `j-responsive-sidebar`, `j-section-footer`, `j-section-header`, `j-sidebar-layout`,
`j-splitter`, `j-stack`, `j-toolbar`, `j-topbar` — these are layout primitives or already expose the
structural input appropriate to their responsibility. `j-page-header` receives complete hierarchy
presets because its title and action contract remains unchanged.

### Media and visualization

`j-carousel`, `j-chart`, `j-dropzone`, `j-file-preview`, `j-file-upload`, `j-gallery`, `j-image`,
`j-image-preview`, `j-sparkline`, `j-video-player` — meaningful alternatives require new media data,
thumbnail models, chart semantics, preview behavior, or upload workflow. Existing file-upload modes
remain the supported presentation concepts.

### Navigation and menus

`j-accordion-panel`, `j-command-palette`, `j-context-menu`, `j-mega-menu`, `j-menu`, `j-menubar`,
`j-sidebar-nav`, `j-tab`, `j-tiered-menu` — child components inherit their container presentation,
while menu differences are navigation type, nesting, popup behavior, or data shape. Variants were
added to `j-accordion`, `j-breadcrumb`, `j-stepper`, and `j-tabs`.

### Overlays and feedback

`j-bottom-sheet`, `j-confirm-dialog`, `j-confirm-popup`, `j-dialog`, `j-drawer`, `j-dynamic-dialog`,
`j-notification-center`, `j-overlay-panel`, `j-popover`, `j-toast` — placement, modality, severity,
dismissal, and focus management are behavioral concerns or separate component responsibilities.

### Scheduling and productivity

`j-calendar-scheduler`, `j-gantt`, `j-kanban`, `j-org-chart` — alternate layouts require different
data or interaction models. `j-timeline` receives presentation-only activity and alternating layouts.

### Status pages

`j-empty-page`, `j-error-page`, `j-maintenance-page` — these components represent different semantic
page responsibilities rather than variants of one component.

## Compatibility and accessibility

All new variants use semantic JRNG UI tokens and logical CSS properties. Defaults remain unchanged.
Interactive variants retain native button/link behavior, focus-visible styling, disabled semantics,
current/selected/completed/error states, and existing outputs. Responsive rules preserve long labels
and collapse only supporting presentation detail. Motion is disabled or reduced under
`prefers-reduced-motion` where a changed indicator can animate.
