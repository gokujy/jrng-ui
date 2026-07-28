# Documentation rebuild audit

Baseline captured on 2026-07-28 from source, public entry points, the generated registry, compiled documentation examples, routes, navigation, search metadata, theme shell, and validation scripts. Roadmap claims were not used as implementation evidence.

## Baseline summary

| Measure                                          | Baseline |
| ------------------------------------------------ | -------: |
| Public components                                |      122 |
| Public entry points                              |      130 |
| Component documentation records/routes           |      122 |
| Existing examples reported by coverage generator |      547 |
| Generated focused API examples                   |      611 |
| File-backed preview/source demos                 |        6 |
| Preview/source mismatches detected               |        0 |
| Shared-state examples detected automatically     |        0 |
| Missing component routes                         |        0 |
| Missing navigation/search records                |        0 |
| Implemented advanced components hidden from docs |        0 |
| Forbidden business labels found                  |        5 |
| Removed selectors present                        |        0 |
| Fake or outdated documented APIs detected        |        0 |

Component documentation currently uses `/docs/components#<slug>` fragment routes. The registry, component catalog, and search index cover all 122 selectors, but many components rely on broad generated API examples that group unrelated properties. Those examples compile and provide complete mechanical coverage; they are not sufficient evidence of a clear, focused documentation experience.

The five forbidden labels are in the shared table preview: `Client code`, `Legal name`, `Public name`, `Parent account`, and `Billing type`. They must be replaced with fictional customer terminology during the relevant preview phase.

## Component review inventory

Navigation is present for every row below. “Generated” means the generic preview/API generator currently supplies most examples; “dedicated” means component-specific documentation exists but still needs the requested focused review.

| Component           | Selector                | Category  | Existing examples | Confusion found              | Missing API coverage     | Route                  | Navigation | Required action             | Status        |
| ------------------- | ----------------------- | --------- | ----------------- | ---------------------------- | ------------------------ | ---------------------- | ---------- | --------------------------- | ------------- |
| Autocomplete        | `j-autocomplete`        | Form      | Generated         | Broad API groups             | Focused UX proof         | `#autocomplete`        | Yes        | Rebuild focused examples    | Needs rebuild |
| Checkbox            | `j-checkbox`            | Form      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#checkbox`            | Yes        | Standardise                 | Needs rebuild |
| Chips               | `j-chips`               | Form      | Generated         | Broad API groups             | Focused UX proof         | `#chips`               | Yes        | Rebuild focused examples    | Needs rebuild |
| Color Picker        | `j-color-picker`        | Form      | Generated         | Broad API groups             | Focused UX proof         | `#color-picker`        | Yes        | Rebuild focused examples    | Needs rebuild |
| Cron Expression     | `j-cron-expression`     | Form      | Dedicated         | Advanced coverage incomplete | Focused schedules/forms  | `#cron-expression`     | Yes        | Expand advanced docs        | Needs rebuild |
| Date Picker         | `j-date-picker`         | Form      | Generated         | Broad API groups             | Focused UX proof         | `#date-picker`         | Yes        | Rebuild focused examples    | Needs rebuild |
| Editor              | `j-editor`              | Form      | Generated         | Broad API groups             | Focused UX proof         | `#editor`              | Yes        | Rebuild focused examples    | Needs rebuild |
| Form Field          | `j-form-field`          | Form      | Generated         | Broad API groups             | Focused UX proof         | `#form-field`          | Yes        | Rebuild focused examples    | Needs rebuild |
| Icon Field          | `j-icon-field`          | Form      | Generated         | Broad API groups             | Focused UX proof         | `#icon-field`          | Yes        | Rebuild focused examples    | Needs rebuild |
| Input               | `j-input`               | Form      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#input`               | Yes        | Standardise                 | Needs rebuild |
| Input Group         | `j-input-group`         | Form      | Generated         | Broad API groups             | Focused UX proof         | `#input-group`         | Yes        | Rebuild focused examples    | Needs rebuild |
| Input Mask          | `j-input-mask`          | Form      | Generated         | Broad API groups             | Focused UX proof         | `#input-mask`          | Yes        | Rebuild focused examples    | Needs rebuild |
| Input Number        | `j-input-number`        | Form      | Generated         | Broad API groups             | Focused UX proof         | `#input-number`        | Yes        | Rebuild focused examples    | Needs rebuild |
| Input OTP           | `j-input-otp`           | Form      | Generated         | Broad API groups             | Focused UX proof         | `#input-otp`           | Yes        | Rebuild focused examples    | Needs rebuild |
| Knob                | `j-knob`                | Form      | Generated         | Broad API groups             | Focused UX proof         | `#knob`                | Yes        | Rebuild focused examples    | Needs rebuild |
| Label               | `j-label`               | Form      | Generated         | Broad API groups             | Focused UX proof         | `#label`               | Yes        | Rebuild focused examples    | Needs rebuild |
| Listbox             | `j-listbox`             | Form      | Generated         | Broad API groups             | Focused UX proof         | `#listbox`             | Yes        | Rebuild focused examples    | Needs rebuild |
| Multiselect         | `j-multiselect`         | Form      | Generated         | Broad API groups             | Focused UX proof         | `#multiselect`         | Yes        | Rebuild focused examples    | Needs rebuild |
| Password            | `j-password`            | Form      | Generated         | Broad API groups             | Focused UX proof         | `#password`            | Yes        | Rebuild focused examples    | Needs rebuild |
| Query Builder       | `j-query-builder`       | Form      | Dedicated         | Advanced coverage incomplete | Nested/forms/templates   | `#query-builder`       | Yes        | Expand advanced docs        | Needs rebuild |
| Radio               | `j-radio`               | Form      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#radio`               | Yes        | Standardise                 | Needs rebuild |
| Radio Group         | `j-radio-group`         | Form      | Generated         | Broad API groups             | Focused UX proof         | `#radio-group`         | Yes        | Rebuild focused examples    | Needs rebuild |
| Rating              | `j-rating`              | Form      | Generated         | Broad API groups             | Focused UX proof         | `#rating`              | Yes        | Rebuild focused examples    | Needs rebuild |
| Select              | `j-select`              | Form      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#select`              | Yes        | Standardise                 | Needs rebuild |
| Select Button       | `j-select-button`       | Form      | Generated         | Broad API groups             | Focused UX proof         | `#select-button`       | Yes        | Rebuild focused examples    | Needs rebuild |
| Slider              | `j-slider`              | Form      | Generated         | Broad API groups             | Focused UX proof         | `#slider`              | Yes        | Rebuild focused examples    | Needs rebuild |
| Switch              | `j-switch`              | Form      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#switch`              | Yes        | Standardise                 | Needs rebuild |
| Textarea            | `j-textarea`            | Form      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#textarea`            | Yes        | Standardise                 | Needs rebuild |
| Time Picker         | `j-time-picker`         | Form      | Generated         | Broad API groups             | Focused UX proof         | `#time-picker`         | Yes        | Rebuild focused examples    | Needs rebuild |
| Toggle Button       | `j-toggle-button`       | Form      | Generated         | Broad API groups             | Focused UX proof         | `#toggle-button`       | Yes        | Rebuild focused examples    | Needs rebuild |
| Button              | `j-button`              | Button    | Dedicated         | Overloaded variants          | Focused action examples  | `#button`              | Yes        | Split examples              | Needs rebuild |
| Copy Button         | `j-copy-button`         | Button    | Dedicated         | Dense states                 | Verify meaningful APIs   | `#copy-button`         | Yes        | Standardise                 | Needs rebuild |
| Calendar Scheduler  | `j-calendar-scheduler`  | Data      | Generated         | Broad API groups             | Focused advanced proof   | `#calendar-scheduler`  | Yes        | Rebuild advanced examples   | Needs rebuild |
| Column Filter       | `j-column-filter`       | Data      | Dedicated         | Table coupling               | Focused filter proof     | `#column-filter`       | Yes        | Standardise                 | Needs rebuild |
| Data Display        | `j-data-display`        | Data      | Generated         | Broad API groups             | Focused UX proof         | `#data-display`        | Yes        | Rebuild focused examples    | Needs rebuild |
| Data View           | `j-data-view`           | Data      | Generated         | Broad API groups             | Focused UX proof         | `#data-view`           | Yes        | Rebuild focused examples    | Needs rebuild |
| Filter Bar          | `j-filter-bar`          | Data      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#filter-bar`          | Yes        | Standardise                 | Needs rebuild |
| Gantt               | `j-gantt`               | Data      | Generated         | Broad API groups             | Focused advanced proof   | `#gantt`               | Yes        | Rebuild advanced examples   | Needs rebuild |
| Kanban              | `j-kanban`              | Data      | Generated         | Broad API groups             | Focused advanced proof   | `#kanban`              | Yes        | Rebuild advanced examples   | Needs rebuild |
| Order List          | `j-order-list`          | Data      | Generated         | Broad API groups             | Focused UX proof         | `#order-list`          | Yes        | Rebuild focused examples    | Needs rebuild |
| Org Chart           | `j-org-chart`           | Data      | Generated         | Broad API groups             | Focused UX proof         | `#org-chart`           | Yes        | Rebuild focused examples    | Needs rebuild |
| Paginator           | `j-paginator`           | Data      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#paginator`           | Yes        | Standardise                 | Needs rebuild |
| Table               | `j-table`               | Data      | Dedicated         | Business labels; broad demos | Three filters + API sets | `#table`               | Yes        | Full progressive rebuild    | Needs rebuild |
| Timeline            | `j-timeline`            | Data      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#timeline`            | Yes        | Standardise                 | Needs rebuild |
| Transfer List       | `j-transfer-list`       | Data      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#transfer-list`       | Yes        | Standardise                 | Needs rebuild |
| Tree                | `j-tree`                | Data      | Generated         | Broad API groups             | Focused UX proof         | `#tree`                | Yes        | Rebuild focused examples    | Needs rebuild |
| Tree Table          | `j-tree-table`          | Data      | Dedicated         | Coverage not progressive     | Focused hierarchy sets   | `#tree-table`          | Yes        | Progressive rebuild         | Needs rebuild |
| Virtual Scroller    | `j-virtual-scroller`    | Data      | Generated         | Broad API groups             | Focused UX proof         | `#virtual-scroller`    | Yes        | Rebuild focused examples    | Needs rebuild |
| Accordion           | `j-accordion`           | Panel     | Dedicated         | Dense states                 | Verify meaningful APIs   | `#accordion`           | Yes        | Standardise                 | Needs rebuild |
| Accordion Content   | `j-accordion-content`   | Panel     | Generated         | Child shown alone            | Contextual example       | `#accordion-content`   | Yes        | Rebuild in context          | Needs rebuild |
| Accordion Header    | `j-accordion-header`    | Panel     | Generated         | Child shown alone            | Contextual example       | `#accordion-header`    | Yes        | Rebuild in context          | Needs rebuild |
| Accordion Panel     | `j-accordion-panel`     | Panel     | Generated         | Child shown alone            | Contextual example       | `#accordion-panel`     | Yes        | Rebuild in context          | Needs rebuild |
| Card                | `j-card`                | Panel     | Dedicated         | Dense states                 | Verify meaningful APIs   | `#card`                | Yes        | Standardise                 | Needs rebuild |
| Divider             | `j-divider`             | Panel     | Generated         | Broad API groups             | Focused UX proof         | `#divider`             | Yes        | Rebuild focused examples    | Needs rebuild |
| Fieldset            | `j-fieldset`            | Panel     | Generated         | Broad API groups             | Focused UX proof         | `#fieldset`            | Yes        | Rebuild focused examples    | Needs rebuild |
| Panel               | `j-panel`               | Panel     | Generated         | Broad API groups             | Focused UX proof         | `#panel`               | Yes        | Rebuild focused examples    | Needs rebuild |
| Splitter            | `j-splitter`            | Panel     | Generated         | Broad API groups             | Focused UX proof         | `#splitter`            | Yes        | Rebuild focused examples    | Needs rebuild |
| Splitter Panel      | `j-splitter-panel`      | Panel     | Generated         | Child shown alone            | Contextual example       | `#splitter-panel`      | Yes        | Rebuild in context          | Needs rebuild |
| Stepper             | `j-stepper`             | Panel     | Dedicated         | Dense states                 | Verify meaningful APIs   | `#stepper`             | Yes        | Standardise                 | Needs rebuild |
| Tab                 | `j-tab`                 | Panel     | Generated         | Child shown alone            | Contextual example       | `#tab`                 | Yes        | Rebuild in context          | Needs rebuild |
| Tabs                | `j-tabs`                | Panel     | Dedicated         | Dense states                 | Verify meaningful APIs   | `#tabs`                | Yes        | Standardise                 | Needs rebuild |
| Text Expand         | `j-text-expand`         | Panel     | Dedicated         | Dense states                 | Verify meaningful APIs   | `#text-expand`         | Yes        | Standardise                 | Needs rebuild |
| Toolbar             | `j-toolbar`             | Panel     | Generated         | Broad API groups             | Focused UX proof         | `#toolbar`             | Yes        | Rebuild focused examples    | Needs rebuild |
| Bottom Sheet        | `j-bottom-sheet`        | Overlay   | Generated         | Broad API groups             | Focus/focus restore      | `#bottom-sheet`        | Yes        | Rebuild overlay examples    | Needs rebuild |
| Confirm Dialog      | `j-confirm-dialog`      | Overlay   | Dedicated         | Dense states                 | Verify meaningful APIs   | `#confirm-dialog`      | Yes        | Standardise                 | Needs rebuild |
| Confirm Popup       | `j-confirm-popup`       | Overlay   | Generated         | Broad API groups             | Focus/focus restore      | `#confirm-popup`       | Yes        | Rebuild overlay examples    | Needs rebuild |
| Dialog              | `j-dialog`              | Overlay   | Dedicated         | Dense states                 | Focus/focus restore      | `#dialog`              | Yes        | Split examples              | Needs rebuild |
| Drawer              | `j-drawer`              | Overlay   | Dedicated         | Dense states                 | Focus/focus restore      | `#drawer`              | Yes        | Split examples              | Needs rebuild |
| Dynamic Dialog      | `j-dynamic-dialog`      | Overlay   | Generated         | Broad API groups             | Programmatic workflow    | `#dynamic-dialog`      | Yes        | Rebuild overlay examples    | Needs rebuild |
| Notification Center | `j-notification-center` | Overlay   | Generated         | Broad API groups             | Focused UX proof         | `#notification-center` | Yes        | Rebuild focused examples    | Needs rebuild |
| Popover             | `j-popover`             | Overlay   | Dedicated         | Dense states                 | Focus/focus restore      | `#popover`             | Yes        | Standardise                 | Needs rebuild |
| Action Menu         | `j-action-menu`         | Menu      | Dedicated         | Dense states                 | Keyboard/templates       | `#action-menu`         | Yes        | Standardise                 | Needs rebuild |
| Breadcrumb          | `j-breadcrumb`          | Menu      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#breadcrumb`          | Yes        | Standardise                 | Needs rebuild |
| Command Palette     | `j-command-palette`     | Menu      | Generated         | Broad API groups             | Keyboard/events          | `#command-palette`     | Yes        | Rebuild navigation examples | Needs rebuild |
| Context Menu        | `j-context-menu`        | Menu      | Generated         | Broad API groups             | Keyboard/events          | `#context-menu`        | Yes        | Rebuild navigation examples | Needs rebuild |
| Mega Menu           | `j-mega-menu`           | Menu      | Generated         | Broad API groups             | Keyboard/events          | `#mega-menu`           | Yes        | Rebuild navigation examples | Needs rebuild |
| Menu                | `j-menu`                | Menu      | Dedicated         | Dense states                 | Keyboard/templates       | `#menu`                | Yes        | Standardise                 | Needs rebuild |
| Menubar             | `j-menubar`             | Menu      | Generated         | Broad API groups             | Keyboard/events          | `#menubar`             | Yes        | Rebuild navigation examples | Needs rebuild |
| Sidebar Nav         | `j-sidebar-nav`         | Menu      | Generated         | Broad API groups             | Responsive/keyboard      | `#sidebar-nav`         | Yes        | Rebuild navigation examples | Needs rebuild |
| Tiered Menu         | `j-tiered-menu`         | Menu      | Generated         | Broad API groups             | Keyboard/events          | `#tiered-menu`         | Yes        | Rebuild navigation examples | Needs rebuild |
| Toast               | `j-toast`               | Messages  | Dedicated         | Dense states                 | Programmatic/events      | `#toast`               | Yes        | Split examples              | Needs rebuild |
| Validation Message  | `j-validation-message`  | Messages  | Generated         | Broad API groups             | Forms/ARIA               | `#validation-message`  | Yes        | Rebuild focused examples    | Needs rebuild |
| Barcode             | `j-barcode`             | Media     | Dedicated         | Advanced coverage incomplete | Formats/export/print     | `#barcode`             | Yes        | Expand advanced docs        | Needs rebuild |
| Carousel            | `j-carousel`            | Media     | Generated         | Broad API groups             | Focused UX proof         | `#carousel`            | Yes        | Rebuild focused examples    | Needs rebuild |
| Gallery             | `j-gallery`             | Media     | Generated         | Broad API groups             | Focused UX proof         | `#gallery`             | Yes        | Rebuild focused examples    | Needs rebuild |
| Html Preview        | `j-html-preview`        | Media     | Generated         | Broad API groups             | Focused UX proof         | `#html-preview`        | Yes        | Rebuild focused examples    | Needs rebuild |
| Image               | `j-image`               | Media     | Generated         | Broad API groups             | Focused UX proof         | `#image`               | Yes        | Rebuild focused examples    | Needs rebuild |
| Video Player        | `j-video-player`        | Media     | Generated         | Broad API groups             | Focused UX proof         | `#video-player`        | Yes        | Rebuild focused examples    | Needs rebuild |
| File Browser        | `j-file-browser`        | File      | Dedicated         | Dense states                 | Customer documents       | `#file-browser`        | Yes        | Rebuild advanced examples   | Needs rebuild |
| File Preview        | `j-file-preview`        | File      | Generated         | Broad API groups             | Focused UX proof         | `#file-preview`        | Yes        | Rebuild focused examples    | Needs rebuild |
| File Upload         | `j-file-upload`         | File      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#file-upload`         | Yes        | Standardise                 | Needs rebuild |
| Chart               | `j-chart`               | Chart     | Generated         | Broad API groups             | Focused chart types      | `#chart`               | Yes        | Rebuild advanced examples   | Needs rebuild |
| Sparkline           | `j-sparkline`           | Chart     | Generated         | Broad API groups             | Focused chart states     | `#sparkline`           | Yes        | Rebuild advanced examples   | Needs rebuild |
| App Shell           | `j-app-shell`           | Layout    | Generated         | Broad API groups             | Responsive layout        | `#app-shell`           | Yes        | Rebuild layout examples     | Needs rebuild |
| Container           | `j-container`           | Layout    | Generated         | Broad API groups             | Responsive layout        | `#container`           | Yes        | Rebuild layout examples     | Needs rebuild |
| Grid                | `j-grid`                | Layout    | Dedicated         | Dense states                 | Responsive layout        | `#grid`                | Yes        | Standardise                 | Needs rebuild |
| Grid Column         | `j-col`                 | Layout    | Dedicated         | Child shown alone            | Contextual example       | `#col`                 | Yes        | Rebuild in context          | Needs rebuild |
| Grid Layout         | `j-grid-layout`         | Layout    | Generated         | Broad API groups             | Focused layouts          | `#grid-layout`         | Yes        | Rebuild advanced examples   | Needs rebuild |
| Grid Row            | `j-row`                 | Layout    | Dedicated         | Child shown alone            | Contextual example       | `#row`                 | Yes        | Rebuild in context          | Needs rebuild |
| Page Header         | `j-page-header`         | Layout    | Dedicated         | Dense states                 | Verify meaningful APIs   | `#page-header`         | Yes        | Standardise                 | Needs rebuild |
| Responsive Sidebar  | `j-responsive-sidebar`  | Layout    | Dedicated         | Dense states                 | Responsive/keyboard      | `#responsive-sidebar`  | Yes        | Standardise                 | Needs rebuild |
| Section Footer      | `j-section-footer`      | Layout    | Generated         | Broad API groups             | Focused UX proof         | `#section-footer`      | Yes        | Rebuild focused examples    | Needs rebuild |
| Section Header      | `j-section-header`      | Layout    | Generated         | Broad API groups             | Focused UX proof         | `#section-header`      | Yes        | Rebuild focused examples    | Needs rebuild |
| Topbar              | `j-topbar`              | Layout    | Generated         | Broad API groups             | Responsive/keyboard      | `#topbar`              | Yes        | Rebuild layout examples     | Needs rebuild |
| Avatar              | `j-avatar`              | Misc      | Generated         | Broad API groups             | Focused states           | `#avatar`              | Yes        | Rebuild focused examples    | Needs rebuild |
| Avatar Group        | `j-avatar-group`        | Misc      | Generated         | Broad API groups             | Focused states           | `#avatar-group`        | Yes        | Rebuild focused examples    | Needs rebuild |
| Badge               | `j-badge`               | Misc      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#badge`               | Yes        | Standardise                 | Needs rebuild |
| Chip                | `j-chip`                | Misc      | Generated         | Broad API groups             | Focused states           | `#chip`                | Yes        | Rebuild focused examples    | Needs rebuild |
| Empty               | `j-empty`               | Misc      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#empty`               | Yes        | Standardise                 | Needs rebuild |
| Icon                | `j-icon`                | Misc      | Generated         | Broad API groups             | Focused states           | `#icon`                | Yes        | Rebuild focused examples    | Needs rebuild |
| Loader              | `j-loader`              | Misc      | Generated         | Broad API groups             | Focused states           | `#loader`              | Yes        | Rebuild focused examples    | Needs rebuild |
| Meter Group         | `j-meter-group`         | Misc      | Generated         | Broad API groups             | Focused states           | `#meter-group`         | Yes        | Rebuild focused examples    | Needs rebuild |
| Progress Bar        | `j-progress-bar`        | Misc      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#progress-bar`        | Yes        | Standardise                 | Needs rebuild |
| Progress Spinner    | `j-progress-spinner`    | Misc      | Generated         | Broad API groups             | Focused states           | `#progress-spinner`    | Yes        | Rebuild focused examples    | Needs rebuild |
| Skeleton            | `j-skeleton`            | Misc      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#skeleton`            | Yes        | Standardise                 | Needs rebuild |
| Status Chip         | `j-status-chip`         | Misc      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#status-chip`         | Yes        | Standardise                 | Needs rebuild |
| Tag                 | `j-tag`                 | Misc      | Dedicated         | Dense states                 | Verify meaningful APIs   | `#tag`                 | Yes        | Standardise                 | Needs rebuild |
| Diff Viewer         | `j-diff-viewer`         | Utilities | Generated         | Broad API groups             | Focused UX proof         | `#diff-viewer`         | Yes        | Rebuild focused examples    | Needs rebuild |
| Highlight           | `j-highlight`           | Utilities | Generated         | Broad API groups             | Focused UX proof         | `#highlight`           | Yes        | Rebuild focused examples    | Needs rebuild |
| Tour Guide          | `j-tour-guide`          | Utilities | Dedicated         | Advanced coverage incomplete | Programmatic/a11y        | `#tour-guide`          | Yes        | Expand advanced docs        | Needs rebuild |
| Error Page          | `j-error-page`          | Pages     | Generated         | Broad API groups             | Focused UX proof         | `#error-page`          | Yes        | Rebuild focused examples    | Needs rebuild |
| Maintenance Page    | `j-maintenance-page`    | Pages     | Generated         | Broad API groups             | Focused UX proof         | `#maintenance-page`    | Yes        | Rebuild focused examples    | Needs rebuild |

## Advanced-component audit

| Component              | Source/public entry point    | Documentation visibility                                     | Classification                              |
| ---------------------- | ---------------------------- | ------------------------------------------------------------ | ------------------------------------------- |
| Query Builder          | Yes / `j-query-builder`      | Route, navigation, search, registry, preview and API present | Implemented but documentation is incomplete |
| Cron Expression Editor | Yes / `j-cron-expression`    | Route, navigation, search, registry, preview and API present | Implemented but documentation is incomplete |
| Barcode                | Yes / `j-barcode`            | Route, navigation, search, registry, preview and API present | Implemented but documentation is incomplete |
| Calendar Scheduler     | Yes / `j-calendar-scheduler` | Visible                                                      | Implemented but documentation is incomplete |
| Gantt                  | Yes / `j-gantt`              | Visible                                                      | Implemented but documentation is incomplete |
| Kanban                 | Yes / `j-kanban`             | Visible                                                      | Implemented but documentation is incomplete |
| Chart                  | Yes / `j-chart`              | Visible                                                      | Implemented but documentation is incomplete |
| Sparkline              | Yes / `j-sparkline`          | Visible                                                      | Implemented but documentation is incomplete |
| File Browser           | Yes / `j-file-browser`       | Visible                                                      | Implemented but documentation is incomplete |
| File Preview           | Yes / `j-file-preview`       | Visible                                                      | Implemented but documentation is incomplete |
| Editor                 | Yes / `j-editor`             | Visible                                                      | Implemented but documentation is incomplete |
| Gallery                | Yes / `j-gallery`            | Visible                                                      | Implemented but documentation is incomplete |
| Grid Layout            | Yes / `j-grid-layout`        | Visible                                                      | Implemented but documentation is incomplete |
| Tour Guide             | Yes / `j-tour-guide`         | Visible                                                      | Implemented but documentation is incomplete |
| Pivot Table            | No                           | None                                                         | Not implemented                             |
| Diagram                | No                           | None                                                         | Not implemented                             |
| Map                    | No                           | None                                                         | Not implemented                             |
| Chat                   | No                           | None                                                         | Not implemented                             |
| Dock Manager           | No                           | None                                                         | Not implemented                             |
| Spreadsheet            | No                           | None                                                         | Not implemented                             |
| Image Editor           | No                           | None                                                         | Not implemented                             |
| Ribbon                 | No                           | None                                                         | Not implemented                             |
| Code Editor            | No                           | None                                                         | Not implemented                             |
| Block Editor           | No                           | None                                                         | Not implemented                             |
| Document Editor        | No                           | None                                                         | Not implemented                             |

No fake documentation was found for an unimplemented advanced component.

## Architecture findings

- Component inventory, category navigation, component search, route fragments, and API-example coverage are generated from source/registry data.
- All public components have a registry record, documentation record, rendered preview registration, basic code, API reference, direct test mapping, and accessibility metadata.
- Six file-backed demos have exact generated source tabs and verified selectors. Most component examples are metadata/template driven, so preview/source accuracy needs stronger validation.
- Copy-code is centralized in `CodeBlockComponent`; browser clipboard access is guarded.
- The docs shell owns theme configuration. The existing topbar popup exposes primary color, light/dark mode, and density; it lacks the required preset/surface selections and right-side drawer behavior.
- The homepage is a custom JRNG page but does not yet deliver the requested customer-dashboard showcase and progressive sections.
- The SSR smoke application exists and builds successfully. Direct browser use in the docs shell is guarded with `isPlatformBrowser`.

## Baseline validation

| Command                           | Result                                                      |
| --------------------------------- | ----------------------------------------------------------- |
| `npm run build:lib`               | Pass; 122 components built                                  |
| `npm run build:docs:app`          | Pass; production docs bundle built                          |
| `npm run docs:check-routes`       | Pass; 122 routes, 0 duplicates, 0 broken                    |
| `npm run docs:check-completeness` | Pass; 122/122 docs, previews, examples, APIs and tests      |
| `npm run docs:check-examples`     | Pass; 122 compiled examples, 0 invalid                      |
| `npm run verify:registry`         | Pass; 122 components                                        |
| `npm run verify:api`              | Pass; 130 entry points compile for a strict consumer        |
| `npm test`                        | Pass; jsdom emits non-failing navigation/CSS parse warnings |
| `npm run lint`                    | Pass                                                        |
| `npm run pack:dry-run`            | Pass; 272 files, 494.7 kB packed, 3.4 MB unpacked           |
| `npm run build:ssr`               | Pass                                                        |

There are no pre-existing failing validation commands. The npm client prints a non-failing warning for the unknown `min-release-age` environment configuration.

## Working-tree boundary

Before this audit began, three video assets were staged and three documentation preview/data files were modified. They are user-owned pre-existing work and are excluded from this phase commit.

## Rebuild progress

### Phase 4 — Forms, actions, and feedback

- Form, Button, Messages, and Misc API examples now separate appearance, state, configuration, and accessibility inputs instead of repeating one broad property group.
- Basic Input Mask, Input Number, Select, Switch, Copy Button, Toast, Validation Message, Chip, Badge, Tag, Status Chip, Spinner, and Skeleton previews were simplified to one primary concept.
- Generated labels, projected content, form values, options, table headers, and chart series now use fictional customer scenarios.
- The duplicate unreachable Copy Button preview branch was removed.
- API coverage remains complete for 122 components, 1,446 inputs, 241 outputs, and 713 registry methods.

### Phase 5 — Navigation, overlays, layout, data display, and media

- Menu, Overlay, Layout, Panel, Media, and File API cards now keep appearance, state, configuration, and accessibility examples focused instead of repeating broad configuration sets.
- Visible menu, dialog, drawer, popover, card, accordion, panel, application-shell, grid, tree, tree-table, upload, browser, and preview examples now use fictional customer scenarios.
- Existing user-owned video-preview work remains isolated and was not staged or committed by this phase.
- Route, compiled-example, API-example, lint, and documentation-build validation pass. The docs build retains the pre-existing non-failing 1.15 MB initial-bundle warning.

### Phase 6 — Table

- The Table page now contains 239 focused examples, including three new independent filtering experiences: Inline Column Filters, Filters Above Table, and Expandable Filter Panel.
- Each new filtering component creates its own customer array and owns its draft/applied filters, sorting, pagination, loading, empty-result, and panel state.
- Filtering is case-insensitive, combines active criteria with AND logic, restores the full dataset when cleared, and preserves advanced-filter drafts while the panel is collapsed.
- The new examples use JRNG inputs, selects, date pickers, number input, buttons, chips, badges, avatars, tooltip, and table components with theme tokens and reduced-motion handling.
- Legacy Table preview labels and data fields using the forbidden Client code, Legal name, Public name, Parent account, and Billing type terminology were replaced with Customer ID, Customer Name, Company, Account Manager, and Subscription.
- Library/docs tests, lint, docs build, route checks, compiled-example checks, and API-example validation pass. The production docs bundle retains the non-failing 1.15 MB initial-bundle warning.

### Phase 7 — Tree Table and advanced previews

- Tree Table now has 14 progressive examples covering basic hierarchy, expansion, controlled expansion, lazy children, sibling sorting, filtering, single/multiple/checkbox selection, templates, empty data, keyboard navigation, RTL, and accessibility.
- Unsupported Tree Table loading and error inputs were not invented; generated API coverage continues to map only APIs present in source.
- Chart, Sparkline, Calendar Scheduler, Gantt, Kanban, Editor, Tour Guide, Query Builder, Cron Expression, and Barcode previews now use fictional customer growth, segmentation, meetings, onboarding, notes, tours, reports, tickets, and implementation scenarios.
- Data, Chart, and Utilities generated API examples now isolate appearance, state, configuration, and accessibility controls instead of repeating broad property sets.
- Forbidden BDMS labels and `j-data-grid` references are absent from runtime documentation source.
- API coverage remains complete for 122 components, 1,446 inputs, 241 outputs, and 713 registry methods.

### Phase 8 — Advanced component visibility

- All 14 implemented advanced components have verified source implementations, modular public entry points, registry records, component routes, generated navigation/search metadata, live previews, API/example coverage, accessibility metadata, theme metadata, and direct tests.
- The shared component detail experience supplies keyboard, responsive, testing, CSS variable/theming, accessibility, FAQ, and changelog sections.
- A dedicated `docs:check-advanced` validation fails when an implemented advanced component is hidden or when an unimplemented component receives fake registry/navigation documentation.
- Eleven audited advanced concepts remain correctly absent because they are not implemented.
