# Enterprise replacement and migration guide

Migrate one feature area at a time. Keep the application stable, compare visuals and behavior, and remove duplicated styles only after verification.

## Replacement map

| Custom pattern       | JRNG replacement                     | Key difference                                       |
| -------------------- | ------------------------------------ | ---------------------------------------------------- |
| Form error component | `j-validation-message`               | Registry-driven messages and display modes           |
| Label/error wrapper  | `j-form-field`                       | Owns accessible label/help/error relationships       |
| Value renderer       | `j-data-display`                     | Locale-aware generic display types                   |
| Filter table         | `j-table`                            | Typed filters, query mapping, and saved state        |
| Grid wrapper         | `j-data-grid`                        | Shares table processing while retaining card/list UI |
| API select           | Async JRNG Select controls           | Application supplies `JAsyncDataSource`              |
| Upload wrapper       | `j-file-upload`                      | Application supplies upload/chunk adapters           |
| Avatar list          | `j-avatar-group`                     | Built-in fallback and overflow behavior              |
| Title/header         | `j-page-header` / `j-section-header` | Generic actions and responsive slots                 |
| History list         | `j-timeline` or `j-listbox`          | Compose generic events and actions                   |
| Object comparison    | `j-diff-viewer`                      | Pure diff model with masking callback                |
| Workflow status      | `j-stepper` or `j-timeline`          | Application retains workflow business logic          |
| Activity list        | `j-timeline` or List composition     | Generic items, templates, and lazy loading           |

## 0.1 consolidation map

| Removed import                                       | Replacement                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| `jrng-ui/date-range-picker`                          | `jrng-ui/date-picker` with `selectionMode="range"`                             |
| `jrng-ui/combobox`                                   | `jrng-ui/select` with `searchable`, `filter`, `dataSource`, or `virtualScroll` |
| `jrng-ui/float-label`, `jrng-ui/ifta-label`          | `jrng-ui/label` with `variant="floating"` or `variant="in-field"`              |
| `jrng-ui/image-preview`                              | `jrng-ui/image` with `[previewable]="true"`                                    |
| `jrng-ui/empty-page`                                 | `jrng-ui/empty` with `variant="page"`                                          |
| `jrng-ui/input-icon`                                 | `jrng-ui/icon-field` or `jrng-ui/input-group`                                  |
| `jrng-ui/dashboard-layout`, `jrng-ui/sidebar-layout` | Grid, Drawer, Topbar, Panel and navigation composition                         |
| `jrng-ui/stack`                                      | Grid/flex utilities or layout primitives                                       |
| `jrng-ui/status-page`                                | Empty, Error Page, Alert or message components                                 |
| `jrng-ui/activity-feed`, `jrng-ui/audit-log`         | Timeline or List composition                                                   |
| `jrng-ui/approval-flow`                              | Stepper or Timeline composition                                                |
| `jrng-ui/navigation-progress`                        | Progress Bar or Progress Spinner scoped to the operation                       |

Tour Guide no longer needs `driver.js`. Remove the package and its CSS import, render `<j-tour-guide />` once, and continue controlling tours through `JTourService`.

`jrng-ui/empty-state` remains as a deprecated compatibility entry point for 0.1 only. Migrate to `JEmptyComponent` from `jrng-ui/empty`; the alias is scheduled for removal in 0.2.

## Form error and field wrappers

**Before**

```html
<app-field-error [control]="form.controls.email" />
```

**After**

```html
<j-form-field label="Email" required>
  <j-input [formControl]="form.controls.email" />
  <j-validation-message [control]="form.controls.email" displayMode="touched" />
</j-form-field>
```

Breaking difference: JRNG does not infer application-specific validator text. Migration: register messages, replace the wrapper, verify `aria-describedby`, touched/submitted behavior, server errors, and keyboard focus.

## Value display

**Before:** `<app-value [value]="amount" format="money" />`

**After:** `<j-data-display label="Amount" type="currency" [value]="amount" currency="USD" />`

Breaking difference: status mappings and locale are explicit. Migrate format-by-format. Test null fallback, copy, truncation, screen-reader label, and target locale.

## Tables and grids

**Before:** `<app-filter-table [request]="loadRows" />`

**After:** `<j-table [columns]="columns" dataMode="server" (serverQuery)="loadRows($event)" />`

For cards use `<j-data-grid displayMode="card">`. Backend payload mapping remains application-side. Migrate columns, then filters/sorts, pagination, selection, state, and editing. Test all filter displays, query serialization, mobile layout, state corruption, focus restoration, and export scope.

## Async controls

**Before:** `<app-api-select endpoint="/items" />`

**After:** `<j-select [dataSource]="itemSource" />`

Breaking difference: JRNG accepts a loader rather than an URL or `HttpClient`. Implement `JAsyncDataSource`, then verify cancellation, debounce, caching, paging, hydration, empty/error announcements, object values, and disabled options.

## File upload

**Before:** `<app-upload [service]="storageService" />`

**After:** `<j-file-upload [uploadAdapter]="uploadAdapter" />`

Keep credentials, endpoints, and provider SDKs in the application. Map remote files and server errors, then test type/size/duplicate validation, progress, retry, cancel, reorder, keyboard dropzone, and form submission.

## Avatars and headers

**Before:** `<app-user-stack [users]="users" /> <app-title-bar />`

**After:** `<j-avatar-group [avatars]="avatars" [maxVisible]="5" /> <j-page-header title="Details" />`

Map generic display data and project actions. Test broken images, accessible names, overflow popover, responsive action stacking, back behavior, sticky mode, and loading state.

## Audit, diff, approval, and activity

**Before:** `<app-history /> <app-change-comparison /> <app-workflow /> <app-feed />`

**After**

```html
<j-audit-log [items]="history" />
<j-diff-viewer [before]="before" [after]="after" mode="object" />
<j-approval-flow [steps]="steps" />
<j-activity-feed [items]="activity" />
```

Breaking difference: JRNG knows no action taxonomy, permissions, workflow transitions, or domain statuses. Adapt application DTOs to generic models and retain action handlers outside JRNG. Test masking, timestamps, expansion labels, all approval states, lazy errors, responsive layouts, and custom templates.

## Application-side exclusions

JRNG must not own authentication, authorization, permission directives, tenant logic, plan-specific feature flags, API URLs, request services, token handling, encryption, Firebase, Google Drive, S3 configuration, business status definitions, domain workflows, project-specific validators, or project-specific transformations. Use generic visual models and adapter interfaces at the library boundary.

## Angular 21 migration path

1. Install the latest JRNG package.
2. Add the theme and core providers.
3. Replace field and validation wrappers.
4. Replace data-display helpers.
5. Replace table and grid wrappers.
6. Replace async controls.
7. Replace file-upload wrappers.
8. Replace headers and avatars.
9. Replace audit, activity, diff, and approval patterns.
10. Remove duplicated application SCSS and utilities only after visual verification.

## Older Angular migration path

1. Upgrade to the Angular version supported by the installed JRNG release.
2. Resolve Angular and RxJS compatibility.
3. Stabilize and regression-test the application.
4. Install JRNG.
5. Follow the same module-by-module replacement path above.

Do not replace an entire application in one change. Keep each migration independently testable and reversible.

## Per-module testing checklist

- Existing public behavior and defaults remain unchanged.
- Keyboard order, visible focus, labels, live regions, disabled and readonly states work.
- Light, dark, high-contrast, reduced-motion, mobile, and SSR rendering are verified.
- Loading, empty, error, retry, server validation, and malformed saved-state paths are covered.
- No application service, secret, endpoint, business status, or provider SDK moved into JRNG.
- Preview and code examples match the installed public entrypoint.
