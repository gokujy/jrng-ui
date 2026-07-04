# jrng-ui Audit

Date: 2026-07-04

Scope: current `jrng-ui` workspace state before adding new features. This audit includes the current working tree, including uncommitted select/table additions already present in the library.

## Current package status

- Workspace package: `jrng-ui-workspace` in root `package.json`, private workspace.
- Published library package: `jrng-ui` in `projects/jr/jrng-ui/package.json`, version `0.0.3`.
- Angular version target: Angular `^21.2.0`.
- Package builder: `@angular/build:ng-packagr`.
- Library root: `projects/jr/jrng-ui`.
- Library source root: `projects/jr/jrng-ui/src`.
- Distribution output: `dist/jr/jrng-ui`.
- Root TypeScript config is strict:
  - `strict: true`
  - `noImplicitOverride: true`
  - `noPropertyAccessFromIndexSignature: true`
  - `noImplicitReturns: true`
  - `noFallthroughCasesInSwitch: true`
  - `strictTemplates: true`
  - `strictInjectionParameters: true`
  - `strictInputAccessModifiers: true`
- Library production config uses Angular partial compilation through `projects/jr/jrng-ui/tsconfig.lib.prod.json`.
- Package peer dependencies are Angular only:
  - `@angular/common`
  - `@angular/core`
  - `@angular/forms`
- Runtime library dependency is only `tslib`.
- No direct PrimeNG dependency was found.
- No direct UI framework dependency was found in root/library package metadata or source imports.
- `package-lock.json` contains transitive `tailwindcss` peer metadata, but Tailwind is not declared as a workspace or library dependency and is not imported by source code.
- Current git status before this audit already had uncommitted changes for select/table and README/public API updates. This phase only adds this report.

## Project structure

```text
projects/
  docs/
    public/
    src/
      app/
      index.html
      main.ts
      styles.scss
    tsconfig.app.json
    tsconfig.spec.json
  jr/
    jrng-ui/
      button/
      card/
      dialog/
      input/
      select/
      table/
      toast/
      src/
        lib/
          button/
          card/
          core/
          dialog/
          input/
          select/
          table/
          theme/
          toast/
        public-api.ts
      ng-package.json
      package.json
      tsconfig.lib.json
      tsconfig.lib.prod.json
      tsconfig.spec.json
```

## Existing components

All production components use `ChangeDetectionStrategy.OnPush`.

Angular 21 treats components as standalone by default. The components do not explicitly set `standalone: true`, but they use component-level `imports`, compile successfully, and are usable as standalone imports.

| Component class | Selector | File | Standalone status | OnPush | CVA |
| --- | --- | --- | --- | --- | --- |
| `JrButtonComponent` | `jr-button` | `src/lib/button/button.component.ts` | Standalone by Angular 21 default | Yes | No |
| `JrCardComponent` | `jr-card` | `src/lib/card/card.component.ts` | Standalone by Angular 21 default | Yes | No |
| `JrDialogComponent` | `jr-dialog` | `src/lib/dialog/dialog.component.ts` | Standalone by Angular 21 default | Yes | No |
| `JrInputComponent` | `jr-input` | `src/lib/input/input.component.ts` | Standalone by Angular 21 default | Yes | Yes |
| `JSelectComponent` | `j-select` | `src/lib/select/select.component.ts` | Standalone by Angular 21 default | Yes | Yes |
| `JTableComponent` | `j-table` | `src/lib/table/table.component.ts` | Standalone by Angular 21 default | Yes | No |
| `JrToastContainerComponent` | `jr-toast-container` | `src/lib/toast/toast-container.component.ts` | Standalone by Angular 21 default | Yes | No |

Component notes:

- Button supports variants, sizes, loading, disabled, full width, string icons, content projection, and `(jrPress)`.
- Card supports title, subtitle, variants, clickable styling, and projection slots.
- Dialog supports controlled `open`, size, close button, backdrop close, escape close, focus handoff, and close events.
- Input supports text/password/search/email/number, textarea mode, label, validation messages, icons, disabled state, and `ControlValueAccessor`.
- Select supports native single select, options, validation messages, disabled state, and `ControlValueAccessor`.
- Table supports typed columns/rows, sorting, loading/empty state, row selection, keyboard row selection, pagination, and custom projected cell template.
- Toast container renders service-driven toast notifications.

## Existing services

| Service | File | Provided in root | Notes |
| --- | --- | --- | --- |
| `JrDialogService` | `src/lib/dialog/dialog.service.ts` | Yes | Signal-backed active dialog request service. Not currently integrated into `JrDialogComponent`; consumers must wire usage themselves. |
| `JrToastService` | `src/lib/toast/toast.service.ts` | Yes | Signal-backed toast list with timed removal and helper methods. |

## Existing directives

No production directives were found.

The codebase uses projected attribute selectors in templates/docs such as `jrButtonPrefix`, `jrButtonSuffix`, `jrCardHeader`, `jrCardBody`, `jrCardFooter`, `jrDialogHeader`, `jrDialogBody`, and `jrDialogFooter`, but these are not Angular directive classes.

## Existing pipes

No production pipes were found.

## Existing styles

Component styles:

- `src/lib/button/button.component.scss`
- `src/lib/card/card.component.scss`
- `src/lib/dialog/dialog.component.scss`
- `src/lib/input/input.component.scss`
- `src/lib/select/select.component.scss`
- `src/lib/table/table.component.scss`
- `src/lib/toast/toast-container.component.scss`

Theme styles:

- `src/lib/theme/jr-theme.scss`
- `src/lib/theme/jr-theme.css`

Docs app styles:

- `projects/docs/src/styles.scss`
- `projects/docs/src/app/app.scss`

Selector/class convention status:

- Newer `select` and `table` use requested `j-` selectors and `.j-*` CSS classes.
- Existing `button`, `input`, `card`, `dialog`, and `toast` still use `jr-` selectors and `.jr-*` CSS classes.
- This is a major naming inconsistency relative to the stated target convention of `j-button`, `j-input`, `j-select`, `j-table`, `j-dialog`, etc.

## Current exports

Root public API: `projects/jr/jrng-ui/src/public-api.ts`

Root exports:

- `./lib/button/button.component`
- `./lib/card/card.component`
- `./lib/core/id`
- `./lib/dialog/dialog.component`
- `./lib/dialog/dialog.service`
- `./lib/input/input.component`
- `./lib/select/select.component`
- `./lib/table/table.component`
- `./lib/toast/toast-container.component`
- `./lib/toast/toast.service`

Root alias exports:

- `ButtonComponent` -> `JrButtonComponent`
- `CardComponent` -> `JrCardComponent`
- `DialogComponent` -> `JrDialogComponent`
- `DialogService` -> `JrDialogService`
- `InputComponent` -> `JrInputComponent`
- `SelectComponent` -> `JSelectComponent`
- `TableComponent` -> `JTableComponent`
- `ToastContainerComponent` -> `JrToastContainerComponent`
- `ToastService` -> `JrToastService`

Secondary entrypoints:

| Entrypoint | Folder | Exports |
| --- | --- | --- |
| `jrng-ui/button` | `projects/jr/jrng-ui/button` | `ButtonComponent`, `JrButtonComponent`, button types |
| `jrng-ui/card` | `projects/jr/jrng-ui/card` | `CardComponent`, `JrCardComponent`, card types |
| `jrng-ui/dialog` | `projects/jr/jrng-ui/dialog` | `DialogComponent`, `DialogService`, `JrDialogComponent`, `JrDialogService`, dialog types |
| `jrng-ui/input` | `projects/jr/jrng-ui/input` | `InputComponent`, `JrInputComponent`, input types |
| `jrng-ui/select` | `projects/jr/jrng-ui/select` | `SelectComponent`, `JSelectComponent`, select types |
| `jrng-ui/table` | `projects/jr/jrng-ui/table` | `TableComponent`, `JTableComponent`, table types |
| `jrng-ui/toast` | `projects/jr/jrng-ui/toast` | `ToastContainerComponent`, `ToastService`, `JrToastContainerComponent`, `JrToastService`, toast types |
| `jrng-ui/theme` | package `exports` field | `theme/jr-theme.scss`, `theme/jr-theme.css` |

Secondary entrypoint folders each contain `public-api.ts`, `ng-package.json`, and `package.json`.

Potential export concern:

- `jrCreateId` is exported from the root public API via `./lib/core/id`. This looks like an internal utility and may not be desirable as stable public API.

## Current theme status

- Theme files exist in `projects/jr/jrng-ui/src/lib/theme`.
- `ng-package.json` copies `src/lib/theme/**/*` into package output under `theme`.
- `projects/jr/jrng-ui/package.json` exposes `./theme` with:
  - `sass`: `./theme/jr-theme.scss`
  - `style`: `./theme/jr-theme.css`
  - `default`: `./theme/jr-theme.css`
- Theme provides CSS variables for colors, surfaces, text, borders, spacing, radius, shadow, font sizes, focus ring, and dark mode.
- Dark mode class is `.jr-dark`, which does not follow the target `.j-*` naming convention.
- Theme token names use `--jr-*`, not `--j-*`.

## Current build status

Verified commands:

- `npm run build`: passed.
  - Builds `jrng-ui`.
  - Builds `docs`.
- `npm run test`: passed.
  - Rebuilds `jrng-ui`.
  - Library tests: 8 test files, 34 tests passed.
  - Docs tests: 1 test file, 2 tests passed.

Observed warning:

- npm prints `Unknown env config "min-release-age". This will stop working in the next major version of npm.`
- This warning does not currently fail build or tests.

Build setup:

- `angular.json` defines two projects:
  - `jrng-ui` library
  - `docs` application
- Library build target:
  - Builder: `@angular/build:ng-packagr`
  - Default configuration: production
  - Production tsconfig: `projects/jr/jrng-ui/tsconfig.lib.prod.json`
  - Development tsconfig: `projects/jr/jrng-ui/tsconfig.lib.json`
- Library test target:
  - Builder: `@angular/build:unit-test`
  - tsconfig: `projects/jr/jrng-ui/tsconfig.spec.json`
- Docs app build target:
  - Builder: `@angular/build:application`
  - Entry: `projects/docs/src/main.ts`
  - Styles: `projects/docs/src/styles.scss`
- Root scripts:
  - `npm run build`
  - `npm run build:lib`
  - `npm run build:docs`
  - `npm run test`
  - `npm run test:lib`
  - `npm run test:docs`
  - `npm start`

## Showcase/demo status

- A demo/showcase app exists at `projects/docs`.
- There is no Storybook setup.
- The docs app imports from built package secondary entrypoints:
  - `jrng-ui/button`
  - `jrng-ui/dialog`
  - `jrng-ui/input`
  - `jrng-ui/toast`
- The docs app currently showcases button, input, card-like examples, dialog, toast, and a custom dashboard mock.
- The docs app does not currently import or showcase `jrng-ui/select` or `jrng-ui/table`.
- The docs app uses plain local HTML/CSS for several preview elements instead of exclusively using library components.

## Missing components

Major PrimeNG-replacement surface area not yet present:

- Form controls:
  - checkbox
  - radio button
  - textarea as separate component
  - password with visibility toggle
  - input number
  - input mask
  - autocomplete
  - multi-select
  - listbox
  - date picker/calendar
  - time picker
  - switch/toggle
  - slider
  - rating
  - color picker
  - file upload
- Data:
  - paginator component
  - virtual scroller
  - tree
  - tree table
  - data view
  - order list
  - pick list
  - timeline
- Navigation:
  - menu
  - menubar
  - tiered menu
  - context menu
  - breadcrumb
  - steps
  - tabs/tab view
  - accordion
  - sidebar/drawer
- Overlay:
  - tooltip
  - popover/overlay panel
  - confirm popup
  - confirm dialog service integration
  - drawer/sidebar
- Feedback/status:
  - message
  - inline messages
  - badge
  - tag/chip
  - progress bar
  - progress spinner
  - skeleton
  - block UI
- Layout:
  - panel
  - fieldset
  - splitter
  - divider
  - scroll panel
  - toolbar
  - stepper
- Media/misc:
  - avatar
  - image preview
  - carousel
  - galleria
  - drag/drop helpers

## Broken/incomplete components

- Naming convention is inconsistent:
  - Target selectors should be `j-*`.
  - Existing button/input/card/dialog/toast selectors are `jr-*`.
  - Existing styles use `.jr-*`.
  - Theme uses `.jr-dark` and `--jr-*` tokens.
- Docs and README currently document mixed selector conventions.
- `JrDialogService` is exported but not wired into `JrDialogComponent`; it is a low-level state service rather than a complete dialog orchestration API.
- `JrDialogComponent` has basic focus handoff but does not implement a full focus trap.
- `JrToastService` generates IDs with `Date.now()` and `Math.random()`, which can be awkward for deterministic tests and SSR consistency.
- `JTableComponent` is an early table implementation:
  - No server-side/lazy state API.
  - No filtering.
  - No column resizing/reordering.
  - No selection model input/output for controlled selection.
  - No row expansion.
  - No grouped headers/footers.
  - Sorting is internal and single-column only.
  - Pagination is internal and not a standalone paginator component.
- `JSelectComponent` is native-select based:
  - No filter/search.
  - No overlay option template.
  - No multi-select.
  - Option values are strings only.
- `JrInputComponent` is useful but limited:
  - No clear button.
  - No invalid state derived from `NgControl`.
  - Number inputs still emit string values through CVA.
- Components do not explicitly declare `standalone: true`; this is valid in Angular 21 but less obvious for maintainers and migration readers.
- Root public API exposes `jrCreateId`, which may unintentionally commit an internal utility to public API stability.

## Recommended next phases

1. Stabilize naming before broad feature work.
   - Decide whether to migrate all public selectors/classes/tokens to `j-*`/`.j-*`/`--j-*`.
   - If backwards compatibility is needed, plan aliases and deprecation windows.

2. Define public API standards.
   - Establish component naming, selector naming, event naming, CSS token naming, and entrypoint naming rules.
   - Decide whether internal helpers like `jrCreateId` remain exported.

3. Upgrade docs/showcase.
   - Add select and table demos to `projects/docs`.
   - Add API examples for every component.
   - Consider Storybook only if it will be maintained; otherwise keep the Angular docs app as the canonical showcase.

4. Harden foundations.
   - Add shared accessibility utilities where needed.
   - Add overlay/focus management primitives before building menus, date pickers, popovers, and complex selects.
   - Add shared form-field conventions for labels, hints, errors, described-by IDs, and `NgControl` integration.

5. Build form component suite.
   - Checkbox, radio, switch, textarea, password, number, date picker, autocomplete, multi-select.
   - All form controls should support `ControlValueAccessor`.

6. Build data/navigation suite.
   - Table hardening, paginator, tabs, accordion, menu, breadcrumb, drawer.

7. Build overlay/feedback suite.
   - Tooltip, popover, confirm dialog, message, badge/tag/chip, progress, skeleton.

8. Expand testing.
   - Add keyboard interaction tests for overlays and complex widgets.
   - Add accessibility-focused tests for ARIA relationships and focus behavior.
   - Add docs app coverage for every public component.

## Risk list

- Public API churn risk: selector/token rename from `jr-*` to `j-*` will be breaking unless aliases are supported.
- Migration risk: BDMS migration will be harder if component APIs are expanded before naming and form-field conventions are finalized.
- Accessibility risk: complex replacements such as select, date picker, menus, dialogs, and tables need stronger keyboard/focus behavior than the current early components.
- Overlay architecture risk: implementing each overlay component independently will create duplicated focus, stacking, escape-key, scroll-lock, and positioning behavior.
- Theme compatibility risk: current `--jr-*` tokens and `.jr-dark` are inconsistent with the requested `.j-*` convention.
- Documentation drift risk: README and docs app can diverge from actual secondary entrypoints unless docs are updated with every component phase.
- Service API risk: `JrDialogService` is exported before it is a complete dialog workflow API.
- Internal utility exposure risk: exporting `jrCreateId` may make later internal refactors breaking.
- Dependency risk is currently low: no PrimeNG or direct UI framework dependency was found.
