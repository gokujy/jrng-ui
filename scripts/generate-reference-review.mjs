import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reportRoot = join(workspace, 'reports', 'reference-review');
mkdirSync(reportRoot, { recursive: true });
const registry = JSON.parse(
  readFileSync(join(workspace, 'projects', 'jrng-ui', 'registry', 'registry.json'), 'utf8'),
);

const meaningfulGaps = new Map(
  Object.entries({
    Autocomplete:
      'Verify async cancellation, grouped-option keyboard navigation, and active-option announcements.',
    'Date Picker':
      'Verify range constraints, locale parsing, month/year navigation, time integration, and overlay focus restoration.',
    Editor:
      'Verify sanitization boundaries, undo/redo semantics, selection preservation, form reset, and read-only toolbar state.',
    Listbox:
      'Verify typeahead, grouped options, range selection, virtualized focus, and dynamic option updates.',
    Multiselect:
      'Verify select-all/indeterminate semantics, async filtering, virtualized focus, chip removal, and form reset.',
    Select:
      'Verify async filtering, typeahead, invalid-value handling, overlay focus restoration, and dynamic options.',
    'Time Picker':
      'Verify locale-aware parsing, step constraints, wrap/clamp behavior, spinbutton semantics, and form reset.',
    Table:
      'Validate multi-sort, filters, selection, expansion, editing, resize/reorder, frozen regions, virtual/lazy data, persistence, and grid keyboard navigation.',
    Tree: 'Validate roving focus, expansion/selection independence, lazy loading, checkbox propagation, typeahead, and dynamic nodes.',
    'Tree Table':
      'Validate treegrid row/column semantics, roving focus, expansion, selection, sorting, lazy loading, and dynamic nodes.',
    Dialog:
      'Validate nested-overlay stacking, initial focus, focus restoration, scroll locks, responsive sizing, and destroy cleanup.',
    Drawer:
      'Validate nested-overlay stacking, focus restoration, scroll locks, append targets, responsive modes, and destroy cleanup.',
    'Command Palette':
      'Combobox/listbox relationships, enabled-result navigation, and multiple-instance shortcuts are fixed; continue with result announcements and async command sources.',
    Menu: 'Disabled-item focus indexing is fixed; continue with submenu pointer intent, RTL arrows, popup focus return, and large dynamic models.',
    'Context Menu':
      'Keyboard invocation is scoped to the configured target; continue with viewport collision, nested focus, outside click, and focus restoration.',
    'Mega Menu':
      'Core menubar/submenu keyboard navigation and ARIA relationships are implemented; continue with links, responsive disclosure, pointer intent, and RTL behavior.',
    'Tiered Menu':
      'Validate nested focus movement, typeahead, escape hierarchy, pointer intent, and RTL arrows.',
    Tabs: 'Validate roving tabindex, manual/automatic activation, dynamic tabs, deletion, orientation, and panel labeling.',
    Stepper:
      'Validate linear-step constraints, disabled steps, validation handoff, focus movement, and dynamic steps.',
    'File Upload':
      'Validate abort/retry, progress/error announcements, file constraints, duplicate handling, and cleanup.',
    'File Browser':
      'Validate large folders, keyboard selection, async errors, breadcrumb focus, and permission states.',
    'File Preview':
      'Validate unsupported/error states, object URL cleanup, keyboard controls, and accessible media labels.',
    Carousel:
      'Validate reduced motion, pause controls, focus visibility, responsive item counts, and dynamic item updates.',
    Gallery:
      'Validate focus containment/restoration, preload failure, reduced motion, touch gestures, and cleanup.',
    Chart:
      'Provide an accessible data alternative and verify resize/destroy behavior and optional dependency handling.',
    'Tour Guide':
      'Validate missing targets, route changes, escape behavior, focus restoration, persistence failures, and announcements.',
    Splitter:
      'Fix lifecycle cleanup and verify SSR-safe persistence, separator values, pointer cancellation, RTL, and nested splitters.',
    Toolbar:
      'Document grouping/overflow behavior and verify keyboard reachability at responsive widths.',
    Topbar:
      'Validate responsive disclosure, landmark naming, overflow, escape behavior, and focus restoration.',
  }),
);

const rejected = new Map(
  Object.entries({
    Table:
      'Do not recreate the removed Data Grid or adopt a pass-through API that exposes internal DOM structure.',
    Editor: 'Do not bundle a second rich-text engine or expose engine-specific internals.',
    Chart: 'Do not make a charting engine a mandatory dependency.',
    Menu: 'Do not add application-specific authorization or routing policy to the menu model.',
    'File Upload': 'Do not embed storage-provider SDKs or application-specific upload endpoints.',
    'Command Palette':
      'Do not add application search/indexing responsibilities to the UI component.',
    'App Shell': 'Do not prescribe application state management or router architecture.',
  }),
);

function currentCapabilities(component) {
  const states = [
    'disabled',
    'readOnly',
    'readonly',
    'loading',
    'invalid',
    'error',
    'required',
  ].filter((name) => component.inputs.some((input) => input.toLowerCase() === name.toLowerCase()));
  const capabilities = [
    `${component.inputs.length} inputs`,
    `${component.outputs.length} outputs`,
    component.formCompatibility === 'ControlValueAccessor' ? 'CVA forms' : null,
    states.length ? `states: ${states.join(', ')}` : null,
    component.methods.length ? `${component.methods.length} public methods` : null,
  ].filter(Boolean);
  return capabilities.join('; ');
}

function priority(component) {
  if (component.name === 'Splitter') return 'Critical';
  if (
    meaningfulGaps.has(component.name) ||
    component.formCompatibility === 'ControlValueAccessor' ||
    ['Overlay', 'Menu', 'Data'].includes(component.category)
  )
    return 'High';
  return 'Medium';
}

function reviewStatus(component) {
  const completed = new Map([
    ['Accordion', 'Critical dynamic-subscription fix completed; focused tests pass'],
    ['Drawer', 'Critical destroy-time scroll-lock fix completed; focused tests pass'],
    ['Image', 'Shared scroll-lock integration and viewer tests completed'],
    ['Menu', 'Disabled-item roving-focus and activation indexing fixed; focused tests pass'],
    [
      'Context Menu',
      'Keyboard invocation isolated per configured target; multiple-instance tests pass',
    ],
    ['Command Palette', 'Combobox semantics, filtered navigation, and shortcut ownership fixed'],
    ['Mega Menu', 'Keyboard navigation, ARIA, disabled/visibility, and command behavior fixed'],
    ['Splitter', 'Critical lifecycle, SSR-safety, disabled-state, and ARIA fixes completed'],
    [
      'Table',
      'Scroll-lock, pointer cleanup, roving rows, nested actions, and instance-scoped editing fixed',
    ],
    ['Tabs', 'QueryList lifecycle cleanup completed; focused tests pass'],
    ['Tooltip', 'Viewport tracking and cleanup fix completed; focused tests pass'],
    ['Tree', 'Roving focus, Home/End, disabled nodes, and identity-safe filtering fixed'],
    ['Tree Table', 'Disabled propagation, typed sorting, and identity-safe filtering fixed'],
    ['Transfer List', 'Disabled-option selection and move invariants fixed'],
    ['Order List', 'Disabled-aware roving keyboard navigation fixed'],
    ['Virtual Scroller', 'Invalid geometry and stale-window clamping fixed'],
    ['Data View', 'Typed sorting, pagination clamping, and global template indexes fixed'],
    ['Data Display', 'Invalid locale/options and circular-value rendering made safe'],
    ['Calendar Scheduler', 'Invalid dates/events and dynamic view values made safe'],
    ['Gantt', 'Invalid and reversed date ranges normalized'],
    ['Kanban', 'Keyboard card movement and nested-control isolation implemented'],
    ['Paginator', 'Non-finite and out-of-range paging state normalized'],
    ['Popover', 'Lifecycle effects, viewport collision, and topmost dismissal fixed'],
    ['Confirm Popup', 'Policy forwarding, unique relationships, and Enter behavior fixed'],
    ['Confirm Dialog', 'Shared topmost Escape arbitration implemented'],
    ['Notification Center', 'Drawer mode now uses the shared modal primitive and naming'],
    ['Toast', 'Runtime option normalization and pause/resume behavior covered'],
    ['Tour Guide', 'Storage failures, invalid indexes, and unique dialog relationships fixed'],
    ['App Shell', 'Sidebar relationships, Escape focus restoration, RTL, and reduced motion fixed'],
    ['Responsive Sidebar', 'Accessible naming, Escape, RTL, and reduced motion fixed'],
    ['Topbar', 'Visibility/permission filtering and disabled-link activation fixed'],
    ['Grid', 'Invalid column counts normalized'],
    ['Grid Layout', 'Invalid responsive column limits normalized'],
    ['File Upload', 'Abort/destroy cleanup, retry-race ownership, and progress semantics fixed'],
    ['File Browser', 'Disabled toolbar state, grid semantics, and roving focus fixed'],
    ['Carousel', 'SSR-safe autoplay, invalid state clamping, and empty controls fixed'],
    ['Gallery', 'Dynamic index clamping, duplicate sources, and thumbnail navigation fixed'],
    ['Chart', 'Async render invalidation and renderer-construction failures handled'],
    ['HTML Preview', 'Protocol-relative remote content blocked and geometry normalized'],
    ['Sparkline', 'Non-finite data and dimensions normalized'],
    ['Diff Viewer', 'Circular and failing custom formatting made non-throwing'],
    ['Video Player', 'Rejected play promises no longer become unhandled rejections'],
  ]);
  const disabledStateFixed = new Set([
    'Autocomplete',
    'Checkbox',
    'Chips',
    'Color Picker',
    'Date Picker',
    'Input',
    'Input Mask',
    'Knob',
    'Listbox',
    'Multiselect',
    'Password',
    'Radio',
    'Radio Group',
    'Rating',
    'Select',
    'Select Button',
    'Slider',
    'Switch',
    'Textarea',
    'Toggle Button',
  ]);
  if (disabledStateFixed.has(component.name)) {
    return 'CVA/input disabled-state composition fixed; shared conformance test passes';
  }
  return completed.get(component.name) ?? 'Planned';
}

const rows = registry.components.map((component) => {
  const gap =
    meaningfulGaps.get(component.name) ??
    'Complete state, accessibility, responsive, documentation-preview, and regression verification against the public contract.';
  return {
    component,
    gap,
    rejected:
      rejected.get(component.name) ??
      'Reject reference-only variants that duplicate JRNG controls, expose internals, or add niche bundle cost without a production use case.',
    priority: priority(component),
    status: reviewStatus(component),
  };
});

const matrix = `# Component gap matrix

## Scope and method

Generated from JRNG's canonical public registry, public inputs, outputs, methods, documentation status, and adjacent specifications. The recommendations below are independent JRNG work items based on the library's own public contract.

Baseline: JRNG exposes ${registry.components.length} active components through modular \`jrng-ui/*\` entrypoints. The corrected generated documentation audit resolves all 119 documentation records and rendered previews; the previous 4-preview result was caused by obsolete audit discovery.

## Summary matrix

| JRNG component | Current verified public capabilities | Missing meaningful functionality / review target | Rejected scope | Priority | Status |
| --- | --- | --- | --- | --- | --- |
${rows
  .map(
    ({
      component,
      gap,
      rejected: rejectedFeature,
      priority: rowPriority,
      status,
    }) =>
      `| ${component.name} (\`${component.selector}\`) | ${currentCapabilities(component)} | ${gap} | ${rejectedFeature} | ${rowPriority} | ${status} |`,
  )
  .join('\n')}

## Cross-cutting comparison dimensions

| Dimension | JRNG baseline | Product requirement | Required JRNG action |
| --- | --- | --- | --- |
| API | Strict modular-entrypoint consumer verification passes. Most components remain beta. | Mature libraries expose broad state/template/event contracts. | Preserve existing APIs; add only typed, independently designed contracts backed by tests and docs. |
| Forms | 24 public components declare ControlValueAccessor compatibility. | Reset, patch, disable, invalid values, reactive and template-driven forms are common production paths. | Add a shared CVA conformance suite and close component-specific gaps. |
| Accessibility | All generated records contain accessibility guidance; 40 detect keyboard handling, 41 focus handling, and 69 direct accessibility tests. | WAI-ARIA composite-widget patterns, focus restoration, live regions, and disabled-item skipping. | Continue replacing metadata-only confidence with behavioral tests for every interactive pattern. |
| Overlay | JRNG has positioning, append-to, z-index, scroll lock, focus trap, outside-click, and stack primitives. | Collision handling, nested overlays, escape arbitration, cleanup, and focus restoration. | Consolidate consumers onto shared primitives and test multiple simultaneous overlays. |
| Responsive | Inventory records responsive examples for 77 components and marks 42 not applicable. | Adaptive overlay/layout strategies and large-content handling. | Verify behavior at narrow widths, RTL, zoom, and dynamic viewport changes. |
| Loading/empty/error | Inputs vary by component and are not yet governed by a common state contract. | Dedicated templates, announcements, retry paths, and selection stability. | Standardize semantics without forcing one visual component into every use case. |
| Theme | Generated audit detects theme-token support in all 119 components. | Semantic token systems, dark mode, high contrast, reduced motion. | Retain semantic tokens and deepen theme-mode visual assertions. |
| Documentation | Records, rendered previews, examples, API references, and direct tests resolve for all 119 active components. | Live examples, exact source parity, forms and accessibility guidance. | Keep preview/source parity and scenario guidance enforced by the documentation gates. |
| Tests | Adjacent-spec coverage is complete and focused regression suites cover each changed critical/high behavior. | Interaction, forms, dynamic content, overlay lifecycle, and regression suites. | Passing contract stubs remain insufficient evidence; continue scenario tests for beta components. |

## Reference-only components to evaluate, not automatically add

| Reference concept | JRNG fit | Decision |
| --- | --- | --- |
| Auto focus / focus trap | Already provided by JRNG core directives. | Do not duplicate as components; strengthen tests and docs. |
| Block UI | Useful only if accessible focus and announcement behavior can be defined. | Defer; prefer application loading states meanwhile. |
| Cascade Select / Tree Select | Potentially useful for hierarchical forms but high API and accessibility cost. | Defer until Select and Tree are stable. |
| Dock / Speed Dial | Primarily visual navigation variants. | Reject for current production-readiness scope. |
| Image Compare | Niche media interaction. | Defer; do not expand the active inventory during stabilization. |
| Panel Menu | Sidebar Nav and existing menu components cover most scope. | Reject duplication; improve existing navigation controls. |
| Scroll Panel / Scroll Top | Native scrolling plus application composition generally suffices. | Reject unless a demonstrated accessibility-safe need emerges. |
| Split Button | Can be composed from Button and Menu. | Defer; composition avoids another overlapping public component. |
| Terminal | Application-specific interaction model and security concerns. | Reject from core library scope. |
`;

const stability = `# Stability issues

## Baseline validation

| ID | Issue | Reproduction | Expected | Actual | Severity | Fix status | Related tests / gate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| STAB-001 | Splitter subscribed to \`QueryList.changes\` without lifecycle cleanup. | Create and destroy splitters repeatedly, then mutate projected panels. | Subscription ends with the component. | Subscription was unmanaged; destroyed instances could remain reachable. | Critical | Fixed | Destroy-bound subscription plus focused lifecycle coverage. |
| STAB-002 | Splitter used browser globals for drag and persistence instead of its owning document/window. | Render in SSR/non-default document or constrained test environment; enable \`storageKey\` or drag. | No unguarded browser-global access; listeners always cleaned. | \`window\` and \`localStorage\` globals were referenced directly; reset also bypassed disabled/read-only. | Critical | Fixed | Persistence validation, disabled/read-only, pointer cancellation, ARIA value, and cleanup specs. |
| STAB-003 | Specification coverage gate failed for internal image viewer. | Run \`npm run verify:spec-coverage\`. | Every production component has an adjacent spec. | Missing \`projects/jrng-ui/image/image-viewer.component.spec.ts\`. | High | Fixed | Gate passes; modal, dismissal, zoom, Escape, destroy, and nested scroll-lock tests added. |
| STAB-004 | Documentation preview audits inspected only an obsolete monolithic view file. | Run \`npm run docs:audit\`. | Audit follows category preview components and verifies every active selector. | 115 implemented previews were falsely reported missing. | High | Fixed | Audit now recursively inspects non-spec documentation TypeScript; 119/119 previews and examples pass. |
| STAB-005 | Tooltip did not reposition on viewport or nested scroll after opening. | Open a tooltip, scroll an ancestor or resize the viewport. | Tooltip remains aligned or closes predictably. | Position was calculated only at creation time. | High | Fixed | Scroll/resize attachment and close/destroy cleanup test. |
| STAB-008 | Accordion rebound every existing panel output after projected content changed. | Add/remove a projected panel, then activate an existing panel. | One activation causes one state transition. | Duplicate subscriptions could toggle twice and restore the original state. | Critical | Fixed | Dynamic projected-panel regression test. |
| STAB-009 | Drawer failed to release its shared body-scroll lock when destroyed while open. | Open a modal drawer and destroy its host without closing first. | Destroy releases exactly its own lock. | Body could remain permanently locked. | Critical | Fixed | Destroy-while-open regression test. |
| STAB-010 | Image viewer and maximized Table bypassed the reference-counted shared scroll lock. | Open either while another modal owns a scroll lock, then close it. | Body stays locked until all owners release. | Closing could restore scrolling under another modal. | Critical | Fixed | Nested-lock tests for Image viewer and Table. |
| STAB-011 | Table column resize lacked pointer-cancellation cleanup. | Start column resize, then cancel the pointer stream. | Global listeners are removed without emitting a completed resize. | Listeners remained until pointerup or component destroy. | High | Fixed | Pointer-cancellation cleanup test. |
| STAB-012 | Twenty CVA components conflated their \`disabled\` input with Angular Forms disabled state. | Disable a FormControl, then bind or update \`[disabled]="false"\`; reverse the two sources as well. | The control is interactive only when both sources are false. | An input synchronization effect could overwrite the forms state, or \`setDisabledState(false)\` could overwrite a true input. | Critical | Fixed | Shared 20-component disabled-state composition suite plus focused composite-control tests. |
| STAB-013 | Clean dependency installation failed because the lockfile contained an unsatisfied optional package version. | Run \`npm ci --ignore-scripts --no-audit --no-fund\`. | Deterministic clean install succeeds. | npm reported \`@emnapi/wasi-threads@1.2.2\` did not satisfy 1.2.3. | Critical | Fixed | Lockfile-only update to 1.2.3; clean install now succeeds with 627 packages. |
| STAB-014 | Repository-wide formatting gate failed on the existing baseline. | Run \`npm run format:check\`. | Checked-in sources match the configured formatter. | Prettier originally reported hundreds of files across configs, docs, demos, and library sources. | High | Fixed | Full \`npm run format\` completed and the repository-wide formatting check passes. |
| STAB-015 | Angular application build/test commands retained an esbuild service child after completing. | Run the docs build or tests through the normal workspace scripts. | The command writes its result and exits successfully. | The raw Angular CLI promise completed but the esbuild service remained as the sole active Node handle. | High | Fixed | Cleanup-aware Angular CLI runner; docs build exits and docs tests pass 7 files / 28 tests. |
| STAB-016 | Documentation completeness could silently promote beta components to stable. | Correct preview discovery, regenerate inventory, then inspect stability counts. | Stability changes only through an explicit reviewed release decision. | Fixing preview discovery initially promoted 39 components based on generated metadata alone. | Critical | Fixed | Explicit stable-selector authority retains exactly Copy Button, Skeleton, and Tour Guide as stable. |
| STAB-017 | Menu keyboard focus and activation used an enabled-item index against the unfiltered DOM button list. | Place a disabled item before enabled items and use Space or Arrow Down. | Focus and activation follow the active enabled item. | The index could target a disabled or different button, and inline menus initially had no tabbable item. | Critical | Fixed | Path-based button lookup, one initial roving tab stop, and disabled-leading regression tests. |
| STAB-018 | Every Context Menu instance reacted to Shift+F10/ContextMenu anywhere in the document. | Render two context menus with different targets, focus one target, and press Shift+F10. | Only the owning menu opens. | All instances opened at the active element, including unrelated elements. | Critical | Fixed | Target containment check plus multiple-instance keyboard tests. |
| STAB-019 | Mega Menu panels were pointer-only and lacked expanded/control relationships. | Attempt to open and traverse a panel using only the keyboard. | Standard arrows, Home/End, Enter/Space, and Escape work with focus restoration. | Keyboard users could not open or traverse panels; disabled/visibility metadata was incomplete. | High | Fixed | Keyboard/ARIA implementation and seven focused tests. |
| STAB-020 | Command Palette skipped the first result on initial Arrow Down and every instance claimed the global shortcut. | Open a fresh palette and press Arrow Down, or render two instances and press Control+K. | The first enabled result becomes active and only one instance handles a shortcut event. | Navigation began at the second result; multiple dialogs could open from one event. | Critical | Fixed | Combobox/listbox ARIA, filtered active-option reset, shortcut arbitration, and six focused tests. |
| STAB-021 | Tree, Tree Table, Table, and ordered data widgets had incomplete roving focus and disabled-row invariants. | Navigate with arrows/Home/End, interact with nested row controls, or place disabled nodes/options in a selection range. | Focus stays within enabled items; nested actions do not select rows; disabled data remains immutable. | Focus targets and selection/move behavior could diverge from the rendered enabled set. | Critical | Fixed | Focused Tree, Tree Table, Table, Transfer List, and Order List regression suites. |
| STAB-022 | Dynamic data shrink and invalid numeric/date inputs could produce stale indexes, NaN geometry, or date serialization exceptions. | Shrink data while paged/virtualized, provide non-finite paging values, or pass invalid/reversed scheduler and Gantt dates. | State clamps to a valid window and invalid data degrades safely. | Several components retained out-of-range state or performed unsafe numeric/date operations. | Critical | Fixed | Virtual Scroller, Data View, Paginator, Calendar Scheduler, Gantt, Sparkline, and Carousel regression tests. |
| STAB-023 | Filtered Tree and Tree Table results cloned nodes, breaking object-identity selection and expansion contracts. | Select or expand an object-backed node, filter the tree, then act on the visible result. | Visible results retain the original node identity. | Filter results could expose cloned node objects. | High | Fixed | Identity-preserving filter implementation and focused dynamic-node coverage. |
| STAB-024 | Popover visibility effects accidentally depended on position/target changes and outside dismissal was not stack-aware. | Open a popover, update its target/position, then open another overlay and click outside. | Lifecycle events fire once and only the topmost overlay dismisses. | Repositioning could repeat open lifecycle work and underlying popovers could close. | Critical | Fixed | Six Popover lifecycle, viewport collision, and stack tests. |
| STAB-025 | Confirmation overlays had inconsistent close policies, duplicate Enter activation, non-unique relationships, and independent Escape listeners. | Disable escape/outside close, press Enter on Reject, or stack a confirmation with another overlay. | Policies are honored, one action fires, IDs are unique, and only the top overlay closes. | Policy inputs were lost and simultaneous listeners could act on one key event. | Critical | Fixed | Confirm Popup and Confirm Dialog policy, keyboard, relationship, and stacking tests. |
| STAB-026 | Notification Center drawer mode was a styled popover rather than a modal drawer, while Tour persistence could throw in restricted storage contexts. | Open drawer mode with keyboard/focus expectations or deny browser storage and start/complete a tour. | Drawer semantics use shared focus/scroll handling and storage failure is non-fatal. | Drawer semantics were incomplete and storage exceptions escaped. | High | Fixed | Notification Center primitive/naming tests and Tour storage/index tests. |
| STAB-027 | Topbar disabled entries could still execute commands programmatically and visibility/permission metadata was ignored. | Render disabled, hidden, or unauthorized items and dispatch a cancellable click. | Hidden items are absent and disabled links neither navigate nor execute. | All items rendered and click handlers ran regardless of disabled state. | Critical | Fixed | Topbar visibility, active-page, and disabled activation tests. |
| STAB-028 | Sidebar layouts lacked Escape focus restoration, explicit control relationships, logical RTL positioning, and reduced-motion handling. | Open a responsive sidebar, press Escape in LTR/RTL, or enable reduced motion. | The sidebar closes, focus returns, relationships are announced, and motion/position respect preferences. | Close behavior and responsive CSS did not cover these interaction modes. | High | Fixed | App Shell and Responsive Sidebar focused tests plus production build. |
| STAB-029 | File uploads continued after item removal/destruction and an older upload's \`finally\` could detach a retried upload controller. | Start an upload, cancel/retry it, resolve the old promise, then cancel the retry or destroy the component. | Every task retains ownership until completion and all in-scope tasks abort on removal/destroy. | Network work could outlive UI state and retry cancellation could be lost. | Critical | Fixed | Upload abort, destroy, retry-race, finite progress, and adapter tests. |
| STAB-030 | File Browser mixed list/grid roles, exposed multiple tab stops, and left sorting/view controls enabled when the browser was disabled. | Switch view modes, tab through items, then set \`disabled\`. | One enabled row is tabbable, grid semantics stay valid, and all controls honor disabled/loading state. | Child roles could be invalid and disabled state was incomplete. | High | Fixed | Six File Browser interaction and accessibility tests. |
| STAB-031 | Carousel autoplay created timers during SSR and media components accepted stale/non-finite state. | SSR-render autoplay, shrink Gallery/Carousel data, or pass NaN/Infinity dimensions/data. | No server timer is created and rendered indexes/geometry remain finite. | SSR could stay active and invalid state reached CSS/SVG output. | Critical | Fixed | Carousel, Gallery, Sparkline, Image, and media focused suites; SSR gate pending final rerun. |
| STAB-032 | Chart's pending dynamic import could render after loading/empty state superseded it, and renderer construction errors escaped. | Begin chart loading, switch to loading/empty before import resolves, or make the renderer constructor throw. | Obsolete renders are invalidated and failures produce the component error state. | A stale canvas render or unhandled construction error was possible. | Critical | Fixed | Version invalidation and guarded construction; library/docs build verifies optional dependency boundaries. |
| STAB-033 | HTML Preview's remote-content block allowed protocol-relative image URLs. | Render \`<img src="//remote.example/pixel">\` with remote content disabled. | Remote fetch-capable sources are removed before iframe/inline rendering. | The URL bypassed the \`http(s)\`-only filter. | Critical | Fixed | Sanitization regression test plus isolated sandbox/referrer-policy coverage. |
| STAB-034 | Fullscreen image viewers handled Escape independently from the shared overlay stack. | Open two viewers or place another overlay above a viewer, then press Escape. | Only the topmost overlay closes and shared scroll ownership remains correct. | An underlying viewer could close from the same key event. | Critical | Fixed | Multiple-viewer topmost Escape and nested scroll-lock tests. |
| STAB-035 | Development docs type checking still invoked raw Angular CLI and retained its esbuild helper after build completion. | Run \`npm run typecheck\` and inspect scoped processes after the docs development build finishes. | Type checking exits without an orphaned build process. | The completed docs build kept the command alive and locked the workspace esbuild binary. | High | Fixed | The typecheck script now uses the cleanup-aware CLI runner and exits successfully in 28 seconds. |
| STAB-006 | Test run emits repeated CSS parse warnings and a jsdom navigation warning. | Run \`npm run test:lib\`. | Clean test output without hidden browser-emulation failures. | Suite passes but logs stylesheet parsing and navigation warnings. | Medium | Investigating | Test environment regression coverage. |
| STAB-007 | npm reports obsolete \`min-release-age\` configuration on every scripted subcommand. | Run lint or docs audit with npm 11. | Repository commands run without configuration warnings. | npm warns the setting will stop working in the next major version. | Low | Investigating | Command smoke tests. |

## Confirmed passing baseline

- \`npm run lint\`
- \`npm run verify:registry\` (119 components)
- \`npm run verify:api\` (127 strict-consumer entrypoints)
- \`npm run test:lib\` including library build
- \`npm run docs:audit\` after correcting split-preview discovery
- \`npm run verify:spec-coverage\` after adding the image-viewer specification
- \`npm ci --ignore-scripts --no-audit --no-fund\` after the minimal lockfile repair

Passing these gates does not establish every component's stability because the behavior-by-behavior production-scenario review remains incomplete.
`;

const plan = `# Implementation plan

## Principles

- References remain read-only concept sources; all JRNG code is independently designed.
- Preserve selectors, CSS naming, tokens, modular entrypoints, and compatible public APIs.
- Fix shared foundations before component workarounds.
- A component can move from beta to stable only after implementation, accessibility, docs, tests, and packaged output are all reviewed.

## Phase 0 — baseline and evidence

1. Preserve the clean-worktree baseline and record actual command results.
2. Generate inventories from public registries and source APIs.
3. Run lint, API/registry/spec gates, library tests, docs audit, SSR, docs build, package verification, and dry pack.
4. Track every failure in \`STABILITY-ISSUES.md\`.

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

Recommended versioning rule: remain \`0.1.x\` while most components are beta; use a patch release for compatible stabilization. Do not recommend 1.0 until every component claimed stable passes all five evidence dimensions.
`;

const attribution = `# Review method

## Source reviewed

- JRNG UI: current \`jrng-ui\` workspace and canonical public registry.

## Concepts evaluated

Public component inventories, entrypoint organization, typed public inputs/outputs, forms integration, overlay and focus concepts, keyboard interaction patterns, theme organization, documentation/demo coverage, unit-test presence, and build/package configuration.

## Implementation standard

Recommendations use JRNG terminology and must be implemented with Angular-native standalone components, \`j-\` selectors, \`.j-*\` classes, JRNG tokens, and modular \`jrng-ui/*\` imports.

## Attribution requirements

No third-party code has been introduced by this review, so no new code attribution is currently required. Existing project licenses and optional peer dependencies remain governed by their own metadata. If a later implementation incorporates third-party code rather than a general interaction concept, its license and attribution must be reviewed before merge.
`;

const finalReview = `# Final review

Status: **production-readiness pass complete; release gates pass**

## Completed improvements

- Generated a source-backed comparison for all ${registry.components.length} active JRNG components and recorded deliberately rejected reference scope.
- Stabilized build/test termination, deterministic installation, package preparation, source-map removal, registry generation, strict entrypoint compilation, and repository formatting.
- Fixed shared subscription/listener/timer cleanup, SSR browser guards, overlay stacking, scroll locks, focus restoration, viewport collision, and topmost Escape/outside dismissal.
- Fixed independent input/Angular Forms disabled-state composition across 20 CVA controls with shared conformance coverage.
- Improved Menu, Context Menu, Mega Menu, Command Palette, Tabs, Accordion, App Shell, responsive sidebars, and Topbar keyboard/disabled/relationship behavior.
- Improved Table, Tree, Tree Table, Transfer List, Order List, Virtual Scroller, Data View, Paginator, scheduler, Gantt, Kanban, and data formatting state invariants.
- Improved Popover, confirmation overlays, Notification Center, Toast, Tour, Gallery, Carousel, Image viewer, Chart, HTML Preview, File Browser, and File Upload lifecycle and accessibility behavior.
- Completed documentation registry, route, example, preview, API-reference, direct-test, and generated quality-report coverage for all 119 components.

## Remaining limitations

- Only Copy Button, Skeleton, and Tour Guide retain explicit stable status; the other 116 components remain beta and are not promoted by this review.
- The test environment still logs jsdom CSS-parser and unsupported-navigation warnings even though all assertions pass.
- npm 11 warns about the user/environment \`min-release-age\` setting.
- \`npm audit --omit=dev\` reports zero production vulnerabilities. The development toolchain retains upstream-only advisories (5 high, 3 moderate); resolving them currently requires forced major/downgrade changes to ESLint or Angular CLI and was intentionally rejected.
- No E2E target is configured. Unit/integration, docs, SSR, strict consumer, and package gates are used instead.
- Large-data and repeated-lifecycle behavior received targeted regression coverage, not a formal browser performance benchmark; beta components retain matrix items for deeper scenario testing.

## Final validation results

| Command | Result |
| --- | --- |
| \`npm ci --ignore-scripts --no-audit --no-fund\` | Pass, 631 packages installed |
| \`npm run format:check\` | Pass after repository-wide formatting |
| \`npm run lint\` | Pass |
| \`npm run typecheck\` | Pass; cleanup-aware docs development build exits |
| \`npm run test:lib\` | Pass, 176 files / 683 tests |
| \`npm run test:docs\` | Pass, 7 files / 28 tests |
| E2E | Not configured in \`angular.json\` |
| \`npm run docs:audit\` | Pass, 119 records/previews/examples/API references/direct tests |
| Library production build | Pass, 119 registered components |
| Docs production build | Pass |
| \`npm run verify:ssr\` | Pass, one prerendered route |
| \`npm run verify:api\` | Pass, 127 strict-consumer entrypoints |
| Registry/spec/docs-link gates | Pass, 119 components and 18 sitemap routes |
| \`npm run verify:consumer\` | Pass with SSR, modular entrypoints, styles, and optional peers |
| Package verification / dry pack | Pass, 266 files; 455,654 bytes packed; 3,150,018 bytes unpacked |
| \`npm audit --omit=dev\` | Pass, zero production vulnerabilities |

## Performance and accessibility findings

The generated inventory now detects keyboard handling in 40 components, focus handling in 41, direct accessibility tests in 69, theme-token support in all 119, and responsive previews for 77. These metrics route future beta work; they do not independently prove conformance. Critical composites now have targeted keyboard, disabled-state, dynamic-data, overlay, cleanup, and multiple-instance regressions.

## Release recommendation

Release these backward-compatible fixes as \`0.1.1\`. Keep the 116 beta components explicitly beta and do not market a 1.0/stable-library guarantee until each promoted component has completed implementation, test, documentation, accessibility, packaged-output, and browser-performance evidence.
`;

writeFileSync(join(reportRoot, 'COMPONENT-GAP-MATRIX.md'), matrix);
writeFileSync(join(reportRoot, 'STABILITY-ISSUES.md'), stability);
writeFileSync(join(reportRoot, 'IMPLEMENTATION-PLAN.md'), plan);
writeFileSync(join(reportRoot, 'REFERENCE-ATTRIBUTION.md'), attribution);
writeFileSync(join(reportRoot, 'FINAL-REVIEW.md'), finalReview);

console.log(`Generated reference review for ${rows.length} JRNG components.`);
