# Hierarchical inputs, mentions, and split actions

JRNG UI Phase 3 adds `j-split-button`, `j-tree-select`, `j-cascader`, `[jMention]`, and an optional multi-column mode for the existing `j-select`. Each API is independently implemented, standalone, OnPush, SSR-safe, zoneless-compatible, and available from a modular entrypoint.

## Installation and imports

```ts
import { JSplitButtonComponent, JSplitButtonItemDirective } from 'jrng-ui/split-button';
import {
  JTreeSelectComponent,
  JTreeSelectNodeDirective,
  JTreeSelectValueDirective,
} from 'jrng-ui/tree-select';
import { JCascaderComponent, JCascaderOptionDirective } from 'jrng-ui/cascader';
import { JMentionDirective } from 'jrng-ui/mention';
import { JSelectCellDirective, JSelectColumn, JSelectComponent } from 'jrng-ui/select';
```

## Split Button

Use the primary action for the expected command and `model` for related `JMenuItem` commands. `primaryAction` and `menuAction` are intentionally separate. `opened` and `closed` report menu state. Public methods are `focus`, `openMenu`, `closeMenu`, and `toggleMenu`.

```html
<j-split-button
  label="Save customer"
  icon="save"
  [model]="saveActions"
  (primaryAction)="saveCustomer()"
  (menuAction)="runSaveAction($event)"
>
  <ng-template jSplitButtonItem let-item>{{ item.label }}</ng-template>
</j-split-button>
```

Loading and disabled states block both commands. Arrow Down opens the menu, Enter and Space activate the focused native button, and Escape closes the menu and restores focus. Separators and disabled menu items use the existing Menu semantics.

## Tree Select

Tree Select implements `ControlValueAccessor` for single, multiple, and checkbox selection. Inputs cover `nodes`, `selectionMode`, `propagation`, search, lazy loading, virtualization, clearable state, chip overflow, disabled, read-only, loading, empty, and error states. Outputs include `valueChange`, `lazyLoad`, `opened`, `closed`, and `cleared`. Public methods are `open`, `close`, `toggle`, and `clearValue`.

```html
<j-tree-select
  label="Customer segments"
  [nodes]="segments"
  selectionMode="checkbox"
  propagation="both"
  searchable
  clearable
  [(ngModel)]="selectedSegments"
>
  <ng-template jTreeSelectNode let-node>{{ node.label }}</ng-template>
  <ng-template jTreeSelectValue let-nodes="nodes">{{ nodes.length }} selected</ng-template>
</j-tree-select>
```

The trigger controls an ARIA tree supplied by `j-tree`. Arrow keys navigate the tree, Enter and Space select, and Escape closes with focus restoration. Virtual mode supports large flattened records; lazy mode emits child requests. Disabled nodes remain unavailable and read-only mode prevents opening or clearing.

## Cascader

Cascader implements `ControlValueAccessor` and returns the final leaf value while `pathChange` returns the source-record path. `fieldNames` maps custom data, `expandTrigger` chooses click or hover, `displayMode` chooses path or leaf text, and `loadChildren` supports synchronous or promise-based lazy loading with stale-result protection.

```html
<j-cascader
  label="Customer location"
  [options]="locations"
  searchable
  clearable
  [(ngModel)]="location"
>
  <ng-template jCascaderOption let-option>{{ option.label }}</ng-template>
</j-cascader>
```

Arrow Up and Down move within a column, Arrow Right or Enter advances, Arrow Left returns, and Escape closes. On narrow screens only the active level is shown with an accessible back action. Loading, empty, load-error, disabled, and read-only states are rendered explicitly.

## Mentions

`[jMention]` works with native inputs and textareas, JRNG Input and Textarea wrappers, and contenteditable editors when a stable editable surface exists. It recognizes configurable triggers such as `@`, `#`, and `/`, positions suggestions at the caret, preserves surrounding multiline text, and prevents stale asynchronous results.

```html
<j-textarea
  [jMention]="people"
  [triggers]="['@', '#', '/']"
  [dataSource]="searchPeople"
  [debounce]="200"
  [mentionTemplate]="mentionSuggestion"
  (mentionSelected)="mentionChosen($event)"
>
  <ng-template #mentionSuggestion let-item let-active="active">
    {{ item.label }} <small>{{ item.description }}</small>
  </ng-template>
</j-textarea>
```

Arrow keys move through suggestions, Enter or Tab inserts, and Escape closes. Loading, empty, and error labels are configurable. Blur and destroy remove the panel, listeners, timers, and embedded views. For contenteditable editors, applications should verify their editor integration because third-party DOM rewriting can invalidate browser selection ranges.

## Multi-column Select

Passing `columns` enhances `j-select`; it does not create another select control. Each `JSelectColumn` defines `field`, `header`, optional width, alignment, formatter, and sorting. `jSelectCell="field"` supplies a custom cell. Existing search, async data, Forms, virtualization, clear, disabled, read-only, loading, empty, and error behavior remains unchanged.

```html
<j-select
  label="Customer"
  [options]="customers"
  [columns]="columns"
  optionLabel="name"
  optionValue="id"
  searchable
  sortable
  virtualScroll
  [(ngModel)]="customerId"
>
  <ng-template jSelectCell="status" let-value>
    <j-status-chip [label]="value" />
  </ng-template>
</j-select>
```

Rows remain keyboard-selectable and sortable headers are native buttons. Wide panels use configured columns; narrow screens stack labelled fields. Logical alignment supports RTL.

## Accessibility, responsive behavior, and theming

All interactive triggers have accessible names, visible focus, disabled semantics, Escape handling, and focus restoration. Gesture-free keyboard operation is complete. Async messages use status or alert roles. Overlays use logical positioning for RTL and bounded mobile layouts. Motion is limited to theme transitions and respects the repository reduced-motion rules.

Visuals use semantic JRNG tokens for surface, text, muted text, border, primary, danger, radius, shadow, and focus ring. They therefore work with Default, Material, and Nexus presets; light, dark, system, and high-contrast modes need no component-specific palette.

## SSR and hydration

Component construction does not read browser globals. Overlay attachment and caret measurement occur only after browser interaction. Server output contains stable triggers and form labels; hydration attaches interactive panels on demand. Mention provides a safe inactive state when no editable browser surface exists.

## Testing guidance

Test direct rendering, inputs, outputs, public methods, controlled and Forms state, disabled/read-only/loading/empty/error states, async rejection and stale completion, keyboard and pointer interaction, focus restoration, RTL, responsive layout, virtual rows, accessible names and roles, destroy cleanup, SSR construction, and hydration. For Mention, test insertion before and after surrounding text and multiline scrolling.

## FAQ

**Why is Tree Select not a Select variant?** It composes Tree selection and exposes hierarchical propagation, lazy children, and tree keyboard semantics that do not belong in a flat option row.

**Why is Cascader separate from Tree Select?** Cascader commits a final path through level columns; Tree Select chooses tree nodes and can select several branches.

**Can Mention request remote suggestions?** Yes. Return a promise from `mentionSearch`; older results are discarded when the caret query changes.

**Does multi-column mode break existing Select templates?** No. Omitting `columns` preserves the existing list layout and public behavior.

## Changelog

- Added Split Button, Tree Select, Cascader, and Mention public entrypoints.
- Added multi-column, sortable, custom-cell, virtualized, and responsive stacked behavior to Select.
