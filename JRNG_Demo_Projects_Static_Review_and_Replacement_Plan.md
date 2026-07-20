# JRNG UI — Demo Projects Static Review and Replacement Plan

**Review date:** 17 July 2026  
**Reviewed projects:** `bV21(1).zip` and `tg(1).zip`  
**JRNG baseline:** Latest uploaded JRNG UI source, excluding Admin Starter

## Review Safety and Scope

This was a **static source-code review only**.

- The ZIP archives were extracted and source/configuration files were read.
- No `npm install`, package script, Angular build, test command, development server, executable project code, or migration command was run.
- No URL, API endpoint, asset URL, authentication endpoint, Firebase endpoint, or third-party service referenced by either project was opened or called.
- No runtime behavior was assumed where it could not be confirmed statically.
- No project-specific information from this review was saved to memory.

The goal is not to copy either project into JRNG. The goal is to identify repeated, generic UI infrastructure that JRNG should provide first, so project-specific wrappers can later be replaced safely.

---

# 1. Executive Summary

Both projects use PrimeNG extensively, but a large amount of custom code exists around PrimeNG to fill recurring enterprise needs. The strongest repeated areas are:

1. Form validation and error presentation
2. Table filtering, server-side state, column configuration, and selection
3. Generic value/data rendering
4. Async Select, Multiselect, and Autocomplete data loading
5. Page title, section header, breadcrumb, and action layouts
6. Empty/no-data states
7. Avatar fallback and avatar-group overflow
8. File upload, rename, preview, progress, retry, and metadata
9. Rich-text and HTML/email preview
10. History, audit logs, old/new differences, comments, and approvals
11. Status, date, number, link, badge, and relative-time formatting
12. Chart presentation and export

Most of these should **enhance existing JRNG components**, not create duplicate components. A smaller set deserves new generic JRNG primitives such as `j-data-display`, `j-validation-message`, `j-audit-log`, and `j-diff-viewer`.

Authentication, permissions, API endpoints, tenant logic, encryption, project-specific statuses, domain models, and workflow rules must remain in the application layer.

---

# 2. Static Inventory Snapshot

## Project A — bV21

- Angular components detected: **522**
- Directives detected: **19**
- Pipes detected: **7**
- Service files detected: **13**
- PrimeNG tables detected in templates: approximately **264**
- Repeated custom form-error usage: approximately **958**
- Repeated generic data-format usage: approximately **372**
- Repeated no-data usage: approximately **206**
- Repeated custom filter-table usage: approximately **167**
- Duplicate custom selector definitions detected statically: approximately **35**

Major reusable custom areas include form errors, generic data formatting, no-data states, filter tables, table configuration, text expand/collapse, avatar fallback, status pills, file upload, chart cards, email preview, history views, and a rich-text editor wrapper.

## Project B — TG

- Angular components detected: **860**
- Directives detected: **13**
- Pipes detected: **14**
- Service files detected: **43**
- PrimeNG tables detected in templates: approximately **355**
- Repeated custom form-error usage: approximately **1,232**
- Repeated generic display-data usage: approximately **376**
- Repeated custom filter-table usage: approximately **228**
- Repeated title/header wrapper usage: more than **300** combined usages
- Duplicate custom selector definitions detected statically: approximately **68**

Major reusable custom areas include form errors, generic data display, filter tables, title bars, section/form headers, loaders, tooltips, avatar groups, file upload/rename, table configuration, password strength, navigation progress, confirmations, tours, rich-text editing, and audit/history screens.

## Cross-project overlap

The following patterns appear independently in both projects, which is strong evidence that they belong in a reusable platform layer:

- Form error component
- Filter table
- Table configuration
- No-data state
- Email/HTML preview
- Confirmation wrappers
- Angular control-state directives
- Frozen table-column handling
- Label/required-marker handling
- Submit-and-focus-invalid handling
- Select/Multiselect data-loading wrappers
- Table scroll-height calculation
- Form-control casting helpers
- Relative-time formatting
- File download and filename sanitization
- Debounce and value-presence helpers
- JSON-to-FormData conversion
- Date and number formatting helpers

---

# 3. Decision Framework

Each discovered custom pattern is classified into one of four outcomes:

| Outcome | Meaning |
|---|---|
| **Replace now** | JRNG already provides the needed capability with little or no change. |
| **Enhance JRNG first** | JRNG has the correct component, but enterprise functionality is missing. |
| **Add to JRNG** | A genuinely generic reusable primitive is missing. |
| **Keep in application** | The logic is tied to authentication, API/domain rules, tenant behavior, or business workflows. |

---

# 4. Custom-to-JRNG Replacement Matrix

| Demo-project pattern | JRNG target | Decision | Priority |
|---|---|---|---|
| `p-form-errors` / custom form error output | `j-form-field` + new `j-validation-message` | Add/enhance first | Critical |
| Control-state/required/filled directives | JRNG form-control infrastructure | Enhance first | Critical |
| Submit and focus first invalid field | New `jFormSubmit` / `jFocusInvalid` directive | Add | Critical |
| `app-data-format`, `app-display-data` | New `j-data-display` | Add | Critical |
| Custom table wrappers | `j-table` / `j-data-grid` | Enhance first | Critical |
| Custom filter-table wrappers | `j-column-filter` + `j-filter-bar` | Enhance first | Critical |
| Table configuration dialog | JRNG Table Column Manager | Enhance first | Critical |
| Async Select/Multiselect directives | `j-select`, `j-multiselect`, `j-autocomplete` | Build native data-source API | Critical |
| Title bars and page headers | `j-page-header` | Enhance first | High |
| Form/section headers | `j-section-header` | Enhance first | High |
| No-data wrappers | `j-empty-state`, `j-table-empty-state` | Replace now/minor enhancement | High |
| View-more/view-less | `j-text-expand` | Replace now | High |
| Status pill | `j-status-chip` / `j-tag` | Replace now/minor mapping enhancement | High |
| Avatar fallback | `j-avatar` | Enhance first | High |
| Avatar overflow group | `j-avatar-group` | Enhance first | High |
| Custom file uploaders | `j-file-upload` | Enhance first | High |
| File/image preview wrappers | `j-file-preview`, `j-file-browser` | Enhance first | High |
| Summernote/CKEditor wrappers | `j-editor` | Enhance through provider-independent API | High |
| HTML/email preview | New `j-html-preview` or `j-file-preview` HTML mode | Add | High |
| History screens | New `j-audit-log` | Add | High |
| Old/new value comparison | New `j-diff-viewer` | Add | High |
| Comments/activity screens | New `j-comment-thread` / `j-activity-feed` | Add | Medium |
| Approval/status workflow visualization | New `j-approval-flow` | Add | Medium |
| Custom alert/confirm/prompt service | `j-dialog` + `j-confirm-dialog` service extensions | Enhance | Medium |
| Navigation top progress bar | New `j-navigation-progress` | Add | Medium |
| Chart cards and export menus | `j-card` + `j-chart` composition | Enhance chart/export hooks | Medium |
| Dashboard KPI wrappers | `j-card` composition examples | Do not add duplicate component | Medium |
| Question tooltip | `j-tooltip` + `j-icon` composition | Replace now | Medium |
| Search wrappers | `j-input` + hotkey/debounce support | Enhance/compose | Medium |
| Password strength component | `j-password` | Enhance | Medium |
| Feature tours | `j-tour` | Replace after API mapping | Medium |
| Access-denied screen | Status-page composition | UI may use JRNG; access logic stays app-side | Medium |

---

# 5. Critical JRNG Enhancements

## 5.1 Table and Data Grid

The custom table infrastructure in both projects is the most valuable source of enterprise requirements. JRNG should absorb the **generic behavior**, not the project models or endpoint contracts.

### Required filter-display variants

```ts
export type JTableFilterDisplay =
  | 'toolbar'
  | 'row'
  | 'menu'
  | 'none';
```

### `toolbar`

- Filters are displayed above the table.
- Supports global search, field filters, date ranges, status filters, active-filter chips, Apply, and Reset.
- Filter configuration should be schema driven, not hardcoded to search/status/date fields.

### `row` — REF-style

- First header row contains labels and sorting.
- Second header row contains each column’s filter control.
- Match-mode button appears on the **right side of the filter input**.
- Clicking it opens the match-mode list.
- Supports text, number, date, date range, boolean, select, multiselect, and custom templates.

### `menu`

- Filter icon appears inside the `<th>`.
- Clicking it opens a popup.
- Popup order:
  1. Match-mode dropdown
  2. Filter input/control
  3. Clear and Apply actions
- Active-filter indication should remain visible in the header.

### Generic server filter contract

```ts
export interface JTableFilterValue {
  field: string;
  dataType: JTableFilterDataType;
  filterType: JTableFilterType;
  operator: JTableFilterOperator;
  value: unknown;
  systemValue?: unknown;
}
```

Do not lock JRNG to either project’s exact DTO. Provide a serializer/adapter hook:

```ts
filterSerializer?: JTableFilterSerializer;
```

### Additional enterprise table requirements

- Initial filters
- Permanent/non-removable filters
- Multiple constraints with AND/OR
- Date `between` and `notBetween`
- Optional maximum date-range duration
- Server-side pagination, sorting, and filtering
- Client-side mode
- Lazy and virtual modes
- Filter-state caching by `tableId`
- Safe state restore with schema/version validation
- Optional URL-state adapter
- Global search
- Selected rows, selected page, and select-all-across-results semantics
- Disable-selection predicate
- Row expansion
- Row/cell/header class callbacks
- Column resize and reorder
- Column visibility
- Freeze left/right
- Width editor
- Column reset to defaults
- Density selector
- Export hooks
- Maximize/fullscreen
- Loading, empty, no-results, and error states
- Custom cell/header/filter templates

### Table Column Manager

Add an official Table Column Manager rather than keeping application dialogs:

- Drag reorder
- Show/hide columns
- Select all/clear all
- Freeze left or right
- Set width/min/max width
- Reset one column
- Reset all columns
- Save named view
- Restore defaults
- Keyboard-accessible reorder controls

---

## 5.2 Select, Multiselect, and Autocomplete

Both projects use directives that mutate PrimeNG behavior and contain API-loading logic. JRNG should move this behavior inside its own typed components.

### Proposed generic data-source contract

```ts
export interface JOptionQuery {
  search?: string;
  page?: number;
  pageSize?: number;
  filters?: Readonly<Record<string, unknown>>;
  signal?: AbortSignal;
}

export interface JOptionResult<T> {
  items: readonly T[];
  total?: number;
  hasMore?: boolean;
}

export interface JOptionDataSource<T> {
  load(query: JOptionQuery): Promise<JOptionResult<T>>;
  resolveByValue?(value: unknown): Promise<T | null>;
}
```

### Required behaviors

- Local, remote, and remote-lazy modes
- Debounced search
- Request cancellation
- Request deduplication
- Minimum characters before loading
- Page-based or cursor-based pagination
- Infinite scrolling and virtual scrolling
- Cache by search/filter arguments
- Initial selected-value resolution
- Dependent filter arguments
- Grouped options
- Disabled options
- Option templates
- Empty, loading, and error templates
- Retry
- Refresh/invalidate-cache method
- Typed value conversion
- Clear, select-all, and maximum-selection behavior

Endpoint URLs and business-specific dropdown methods must remain outside JRNG.

---

## 5.3 Form Validation System

The extremely high use of custom form-error components in both projects makes this a critical JRNG capability.

### Enhance `j-form-field`

- Automatic required-state detection where safely possible
- Explicit required/optional override
- Helper, warning, success, and error messages
- Angular sync and async validation errors
- Server/API errors
- Touched/dirty/submitted display policies
- Custom error-message map
- Accessible `aria-describedby`
- Error summary compatibility
- Readonly and disabled states
- Horizontal and vertical layouts

### Add `j-validation-message`

```html
<j-validation-message
  [control]="form.controls.email"
  [submitted]="submitted"
  [messages]="emailMessages">
</j-validation-message>
```

Support standard validators:

- required
- requiredTrue
- email
- minlength/maxlength
- min/max
- pattern
- date range
- password policy
- file type/size/count
- custom validator messages
- server errors

### Add form-submit/focus-invalid behavior

- Mark all controls touched
- Find the first invalid enabled control
- Expand collapsed parent sections if possible through hooks
- Scroll it into view
- Focus it safely
- Announce error summary to assistive technology

Suggested APIs:

- `jFormSubmit`
- `jFocusInvalid`
- `JFormErrorService`

### Input normalization

Optional, explicit behavior only:

- Trim on blur or submit
- Number min/max enforcement
- Decimal precision
- Empty-string normalization

Do not silently mutate all values by default.

---

## 5.4 Generic Data Display

The two projects independently created broad “display data” components. JRNG should provide one generic formatter that works inside or outside tables.

### Add `j-data-display`

```ts
export type JDataDisplayType =
  | 'text'
  | 'number'
  | 'currency'
  | 'percent'
  | 'date'
  | 'time'
  | 'dateTime'
  | 'relativeTime'
  | 'duration'
  | 'boolean'
  | 'status'
  | 'badge'
  | 'tag'
  | 'link'
  | 'multiLink'
  | 'list'
  | 'json'
  | 'jsonPath'
  | 'html'
  | 'avatar'
  | 'avatarWithName'
  | 'custom';
```

### Required features

- Null/empty fallback
- Locale and timezone support
- Prefix/suffix
- Number precision
- Status/severity resolver
- Link target and safe URL validation
- List separator or chip layout
- JSON path access
- Avatar fallback
- Text truncation/expand integration
- Custom value resolver
- Custom template
- Copy action
- Accessible labels

The Table should reuse the same internal renderer to avoid separate formatting systems.

---

## 5.5 Page Header and Section Header

Enhance existing components rather than retaining several application wrappers.

### `j-page-header`

- Icon or avatar
- Eyebrow/context label
- Title
- Count badge
- Subtitle/description
- Breadcrumbs
- Back action
- Primary/secondary actions
- Overflow actions
- Tabs or metadata slot
- Loading/skeleton state
- Sticky mode
- `standard | compact | hero` variants
- Responsive stacking

### `j-section-header`

- Title/subtitle
- Icon
- Required-note area
- Tooltip/help action
- Count/status
- Start/end action slots
- Collapsible-section integration
- `plain | bordered | filled | compact` variants
- Horizontal/vertical responsive modes

---

## 5.6 Avatar and Avatar Group

### Enhance `j-avatar`

- Image error fallback
- Initial generation
- Custom fallback icon
- Presence/status
- Tooltip
- Clickable profile action
- Accessible name
- Loading state

### Enhance `j-avatar-group`

- Maximum visible count
- `+N` overflow indicator
- Overflow tooltip or popover
- Full-list template
- Stacked and spaced layouts
- Configurable overlap
- Individual tooltip/detail template
- Presence state
- Anonymous/all-users option through generic configuration

---

## 5.7 File Upload, File Preview, and File Browser

### Enhance `j-file-upload`

- Single and multiple files
- Drag/drop, file picker, and optional paste
- Rename before upload
- Per-file metadata form/template
- File type, size, count, and duplicate validation
- Queue reorder
- Progress per file and overall
- Pending/uploading/success/error/cancelled states
- Retry and cancel
- Preview and download
- Remove before or after upload
- Custom upload adapter
- Custom response mapping
- Manual and automatic upload
- Accessible progress announcements

### Typed upload adapter

```ts
export interface JFileUploadAdapter<TMetadata, TResult> {
  upload(
    file: File,
    metadata: TMetadata,
    context: JFileUploadContext
  ): Promise<TResult>;
}
```

JRNG should not know project endpoint URLs or authorization schemes.

### Enhance preview/browser

- Image, PDF, text, audio, and video
- Explicit unsupported state
- HTML/email preview mode
- Copy, download, print, zoom, and fullscreen when applicable
- Safe URL handling
- Custom renderer adapter

---

## 5.8 Rich Text Editor

One project wraps Summernote and the other uses CKEditor. JRNG should not make either a mandatory core dependency.

### Enhance `j-editor`

- Basic and full toolbar presets
- Custom toolbar configuration
- Bold/italic/underline/strike
- Headings
- Ordered/unordered lists
- Links
- Tables
- Images through an adapter
- HTML/source mode
- Email-content mode
- Paste cleanup
- Configurable sanitization policy
- Readonly/disabled states
- Character count
- Validation integration
- Optional provider adapter for advanced external editors

Never provide a generic bypass-sanitization pipe.

---

## 5.9 Password Strength

Enhance `j-password` with:

- Show/hide toggle
- Strength meter
- Weak/medium/strong labels
- Configurable policy requirements
- Per-requirement pass/fail list
- Custom scoring function
- Breach-check adapter hook, disabled by default
- Accessible live feedback
- Feedback inline or popup

The library provides presentation and policy evaluation; network breach checks stay application-side through an adapter.

---

## 5.10 Charts and Export

Do not add project-specific dashboard-card components. Use composition:

```html
<j-card>
  <j-chart></j-chart>
  <j-menu><!-- export actions --></j-menu>
</j-card>
```

Enhance `j-chart` with:

- Loading, empty, and error states
- Title/subtitle/description slots or Card composition examples
- Optional export hooks for PNG/SVG/PDF/CSV/XLSX
- Data-table fallback
- Accessible summary
- Custom plugin registration
- Tooltip and legend templates
- Click/selection events
- Responsive sizing

Keep Chart.js optional. Do not add Highcharts as a mandatory JRNG dependency.

---

# 6. New Generic JRNG Components

## 6.1 `j-validation-message`

Purpose: standardized Angular validation and server-error presentation.

## 6.2 `j-data-display`

Purpose: generic typed value rendering across detail pages, cards, lists, and tables.

## 6.3 `j-description-list`

Purpose: consistent label/value presentation.

Variants:

- vertical
- horizontal
- grid
- compact
- bordered
- striped
- responsive stacked

## 6.4 `j-audit-log`

Purpose: generic actor/time/action/change history.

Features:

- Actor avatar/name
- Timestamp and relative time
- Action/status
- Date and actor filters
- Pagination or infinite scroll
- Grouping by date/entity
- Attachments or metadata slot
- Expandable details
- Custom item template
- Loading/empty/error states

## 6.5 `j-diff-viewer`

Purpose: old/new value comparison.

Modes:

- inline
- side-by-side
- field list
- JSON/object
- array added/removed/reordered
- text diff through optional adapter

## 6.6 `j-comment-thread` and/or `j-activity-feed`

Purpose: reusable comments, notes, attachments, mentions, and system activity.

Business-specific permissions and persistence remain in the app.

## 6.7 `j-approval-flow`

Purpose: visualization of generic approval steps.

Features:

- Pending/current/completed/rejected/skipped
- Actor and timestamp
- Vertical/horizontal/compact modes
- Optional comments/metadata
- Custom step template

JRNG does not determine who may approve.

## 6.8 `j-html-preview`

Purpose: isolated rendering of trusted HTML/email content.

Features:

- Shadow DOM or sandboxed iframe strategy
- Explicit trusted-content API
- Metadata header slot
- Copy/print/download actions
- Loading/error state
- Link handling policy

No implicit `bypassSecurityTrustHtml` behavior.

## 6.9 `j-navigation-progress`

Purpose: top navigation/loading progress.

Modes:

- router driven
- manual
- determinate
- indeterminate

Features reduced-motion support and no dependency on application routing internals beyond an optional Angular Router adapter.

---

# 7. Directives to Add or Modernize

## Recommended

- `jFormSubmit` — submit-state coordination
- `jFocusInvalid` — focus/scroll first invalid control
- `jStopPropagation` — explicit event propagation utility
- `jCountUp` — accessible number animation with reduced-motion support
- `jTabsIntoView` — keep active tab visible in scrollable tabs
- `jAutoTrim` — optional trim behavior

## Convert workaround directives into native component features

The following should not remain separate directives in JRNG if the component owns the behavior:

- Frozen columns → Table/DataGrid feature
- Dynamic table height → Table responsive height option or resize-observer integration
- Async Select/Multiselect loading → native data-source API
- Input min/max enforcement → InputNumber/validator API
- Required label marker → FormField API

## Keep out of JRNG

- Permission/access guard
- Tenant visibility
- Feature entitlement logic
- API endpoint loading directives

---

# 8. Pipes and Pure Utilities

## Add or enhance in JRNG

### Formatting pipes

- Relative time
- Full relative time
- Duration
- Countdown/day-left where generic
- Highlight text with safe text-node rendering
- Initials
- Mask email/mobile through explicit options
- Join/list formatting
- Fallback value

### Form helpers

- Typed FormControl/FormGroup/FormArray casting helpers or pipes
- Collect invalid controls
- Validation-error normalization

### File helpers

- Sanitize filename
- Validate file type/size/count
- Blob/file download helper
- Human-readable file metadata

### General pure utilities

- `hasValue`
- debounce/throttle
- stable sort
- date range helpers
- JSON-to-FormData
- safe structured clone/deep-copy helper with documented limits
- table filter serialization
- table state versioning/validation

## Do not add

- `safeHtml` or `safeUrl` bypass pipes
- Encryption/crypto helpers
- JWT helpers
- Dynamic script loader
- Manifest/favicon loader
- API endpoint helpers
- Business-specific team/job/quarter/ABN/status pipes
- Worker wrappers unrelated to UI behavior

---

# 9. Services and Infrastructure

## Add or enhance

- `JFormErrorService`
- `JTableStateService`
- `JTableFilterService`
- `JFileExportService` with adapter-based PDF/XLSX support
- `JNavigationProgressService`
- `JAlertDialogService` or extend existing Dialog/Confirmation service
- Option-data cache/controller internal service

## Already suitable in JRNG

- Confirmation service
- Dialog service
- Toast service
- Tour service
- Theme service
- Clipboard service
- Storage service
- Overlay service
- Live-announcer service
- Media-query service

## Keep application-side

- API clients
- Authentication/token refresh
- Firebase
- Access/role services
- Project dropdown endpoints
- Tenant and portal context
- Google Drive integration
- Business notification services
- Domain-specific export layouts

---

# 10. Application-specific Code That Must Not Move to JRNG

Even when repeated, the following do not belong in a generic UI library:

- Permission and access guards
- Access-right IDs and role matrices
- Authentication and authorization services
- JWT, encryption, and cryptographic helpers
- API URLs and endpoint-specific dropdown methods
- Environment-specific resource URLs
- Tenant, portal, practice, team, worksheet, job, or document workflow rules
- Business-specific statuses and colour mappings
- Project-specific confirmation text
- Firebase integrations
- Google Drive integration
- Social login
- Domain-specific pipes and validators
- Project route configuration
- Business audit interpretation
- Project-specific PDF/Excel report structures

JRNG may provide UI primitives and adapter contracts for these features, but the actual rules remain in each application.

---

# 11. Angular Compatibility Risk

The TG project is based on Angular 19, while the reviewed JRNG release expects Angular 21.2.

Before replacing TG components with JRNG, choose one path:

1. **Recommended:** upgrade TG to Angular 21 first, then integrate current JRNG.
2. Publish and maintain a separate Angular 19-compatible JRNG build only when upgrading TG is not currently possible.

Maintaining parallel Angular-major builds increases testing, packaging, and support costs. It should not be the default choice.

The bV21 project is already on Angular 21 and is the safer first migration candidate.

---

# 12. Phased JRNG Implementation Plan

## Phase 0 — Contracts and compatibility

- Confirm Angular version strategy for TG.
- Freeze JRNG public naming and defaults.
- Define shared types for variants, severity, size, density, states, data sources, filter models, and upload adapters.
- Create a mapping document from existing custom selectors to JRNG targets.
- Add deprecation-free compatibility tests for existing JRNG APIs.

## Phase 1 — Critical foundations

1. Form validation system
2. `j-validation-message`
3. Async option data-source contract
4. Select/Multiselect/Autocomplete enhancements
5. `j-data-display`
6. Table filter-display variants
7. Typed server filter serializer

This phase unlocks the largest number of replacements.

## Phase 2 — Enterprise table and common shell UI

1. Table Column Manager
2. Table state persistence/versioning
3. Permanent and initial filters
4. URL-state adapter
5. Page Header and Section Header enhancements
6. Avatar and Avatar Group enhancements
7. File Upload enhancements
8. Empty-state and Text Expand documentation/migration examples

## Phase 3 — Workflow and audit UI

1. `j-audit-log`
2. `j-diff-viewer`
3. `j-comment-thread` / `j-activity-feed`
4. `j-approval-flow`
5. `j-html-preview`
6. Password-strength enhancement
7. Navigation progress
8. Alert/prompt service extensions

## Phase 4 — Rich media and export

1. Editor enhancements
2. Chart export hooks
3. File preview/browser expansion
4. Generic export service adapters
5. Accessibility summaries and print modes

## Phase 5 — Application replacement

Replace project custom code page by page, not through a single mass rewrite.

Recommended sequence:

1. Form errors and control directives
2. Generic data display
3. Table filters and table configuration
4. Headers, no-data, text expand, status, and avatar components
5. File upload and preview
6. Dialogs, confirmations, tooltips, and search
7. Editor and charts
8. History, comments, differences, and approvals
9. Remove unused PrimeNG imports and obsolete wrappers
10. Remove duplicate selectors after all references are migrated

---

# 13. Replacement Acceptance Criteria

A custom component should be removed only after the JRNG replacement meets all applicable criteria:

- Public API covers the current use cases without application-specific conditions.
- Keyboard behavior is complete.
- Focus behavior is predictable.
- ARIA names, descriptions, states, and live announcements are implemented.
- Loading, empty, error, disabled, readonly, and invalid states are covered.
- Desktop and mobile layouts are documented.
- Theme tokens are available.
- Dark mode is validated.
- Reduced motion is respected.
- Unit tests cover behavior and state transitions.
- Integration examples cover Reactive Forms and Signals where applicable.
- Server-side adapters are typed.
- Existing JRNG default behavior remains backward compatible.
- Migration examples show before/after usage.
- Project-specific logic remains outside the library.

---

# 14. Important Architecture Rules

1. **Do not copy application code directly into JRNG.** Extract the generic behavior and redesign it as a typed library API.
2. **Do not expose PrimeNG private internals.** JRNG should own its stable public contract.
3. **Do not add one component for every application wrapper.** Prefer composition and enhancements to existing JRNG components.
4. **Do not mix API access with UI components.** Use adapters/data sources supplied by the application.
5. **Do not add unsafe HTML bypass pipes.** Use explicit trusted-content boundaries.
6. **Do not add business status enums to JRNG.** Use semantic severity resolvers supplied by the application.
7. **Do not maintain duplicate formatting logic.** Table, detail views, and cards should reuse `j-data-display` internals.
8. **Do not add separate KPI/chart-card components unnecessarily.** Use `j-card`, `j-chart`, `j-menu`, and slots.
9. **Keep all new APIs generic and strongly typed.** Avoid `any`-based configuration.
10. **Migrate incrementally.** JRNG must be proven on shared screens before large-scale replacement.

---

# 15. Recommended First Release Scope

The best first enterprise replacement release should contain:

1. `j-validation-message`
2. Enhanced `j-form-field`
3. `jFormSubmit` and `jFocusInvalid`
4. `j-data-display`
5. Async data-source support for Select/Multiselect/Autocomplete
6. Table `toolbar | row | menu | none` filter modes
7. Typed table filter serialization
8. Table Column Manager
9. Enhanced `j-page-header` and `j-section-header`
10. Enhanced `j-avatar` and `j-avatar-group`
11. Enhanced `j-file-upload`
12. Migration examples for no-data, status chip, text expand, tooltip, confirmation, and tour

This scope removes the highest-volume duplicated code while keeping risk manageable.

---

# 16. Final Verdict

The demo projects should not be treated as templates to copy. They should be treated as a large enterprise requirements dataset.

The highest-value strategy is:

> Build the missing generic capability in JRNG, verify it with tests and documentation, migrate one shared pattern at a time, and keep all authentication, API, tenant, and business workflow logic in the application.

Following this approach will allow both projects to gradually replace most custom presentation infrastructure with JRNG while avoiding a bloated, business-specific component library.
