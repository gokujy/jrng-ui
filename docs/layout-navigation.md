# Layout and Navigation

JRNG UI layout/navigation components are standalone Angular components with `j-*` selectors and `.j-*` classes.

## Tabs

```ts
import { JTabsComponent, JTabComponent } from 'jrng-ui/tabs';
```

```html
<j-tabs [(selectedIndex)]="activeTab" lazy>
  <j-tab header="Details">
    Details content
  </j-tab>

  <j-tab header="Approvals" [disabled]="locked">
    Approval content
  </j-tab>

  <j-tab header="Audit" closable>
    Audit trail content
  </j-tab>
</j-tabs>
```

Features:
- `selectedIndex`
- `selectedIndexChange`
- `lazy`
- disabled tabs
- closable tabs
- Arrow, Home, and End keyboard navigation

## Accordion

```ts
import { JAccordionComponent, JAccordionPanelComponent } from 'jrng-ui/accordion';
```

```html
<j-accordion [multiple]="true" [(activeIndex)]="openPanels">
  <j-accordion-panel header="Customer">
    Customer fields
  </j-accordion-panel>

  <j-accordion-panel header="Billing" [disabled]="billingLocked">
    Billing fields
  </j-accordion-panel>
</j-accordion>
```

`activeIndex` accepts a number, an array of numbers when `multiple` is enabled, or `null`.

## Panel

```ts
import { JPanelComponent } from 'jrng-ui/panel';
```

```html
<j-panel header="Invoice summary" toggleable [(collapsed)]="summaryCollapsed">
  Panel content
</j-panel>
```

## Fieldset

```ts
import { JFieldsetComponent } from 'jrng-ui/fieldset';
```

```html
<j-fieldset legend="Tax details" toggleable [(collapsed)]="taxCollapsed">
  GST and tax fields
</j-fieldset>
```

## Toolbar

```ts
import { JToolbarComponent } from 'jrng-ui/toolbar';
```

```html
<j-toolbar>
  <div jToolbarStart>
    <j-button label="New" />
    <j-button label="Import" variant="outlined" />
  </div>

  <j-input placeholder="Search..." />

  <div jToolbarEnd>
    <j-button label="Export" variant="text" />
  </div>
</j-toolbar>
```

Toolbar supports `jToolbarStart`, default center projection, and `jToolbarEnd`.

## Stepper

```ts
import { JStepperComponent, JStepItem } from 'jrng-ui/stepper';

steps: readonly JStepItem[] = [
  { label: 'Customer', completed: true },
  { label: 'Items' },
  { label: 'Review', disabled: false },
];
```

```html
<j-stepper
  [items]="steps"
  [(activeIndex)]="activeStep"
  [linear]="true"
/>
```

## Breadcrumb

```ts
import { JBreadcrumbComponent, JBreadcrumbItem } from 'jrng-ui/breadcrumb';

home: JBreadcrumbItem = { label: 'Home', icon: '⌂', url: '/' };
items: readonly JBreadcrumbItem[] = [
  { label: 'Finance', command: event => openFinance(event.item) },
  { label: 'Invoices' },
];
```

```html
<j-breadcrumb
  [home]="home"
  [model]="items"
  (itemClick)="handleBreadcrumb($event)"
/>
```

## Splitter

```ts
import { JSplitterComponent } from 'jrng-ui/splitter';
```

```html
<j-splitter orientation="horizontal" [gutterSize]="12">
  <j-panel header="Filters">Filters</j-panel>
  <j-panel header="Results">Results</j-panel>
</j-splitter>
```

Current splitter support is layout-only. Drag resizing is intentionally pending.

## Current Coverage

- Tabs with disabled, lazy, closable, and keyboard navigation
- Accordion with single or multiple open panels
- Toggleable panel
- Toggleable fieldset
- Toolbar projection slots
- Model-driven stepper with optional linear flow
- Breadcrumb model, home item, command callback, and item click output
- Basic splitter layout

## Pending Advanced Items

- Drag-resizable splitter gutters
- RouterLink integration for breadcrumb without requiring app-specific router imports
- Tab drag reorder
- Accordion custom header templates
- Stepper projected step templates

