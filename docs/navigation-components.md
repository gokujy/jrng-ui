# JRNG UI Navigation Components

JRNG UI navigation components are standalone, generic Angular components with `j-*` selectors, `.j-*` classes, keyboard support, accessible roles, and original token-driven styling.

## Imports

```ts
import { JMenuComponent, JMenuItem } from 'jrng-ui/menu';
import { JContextMenuComponent } from 'jrng-ui/context-menu';
import { JTieredMenuComponent } from 'jrng-ui/tiered-menu';
import { JMenubarComponent } from 'jrng-ui/menubar';
import { JMegaMenuComponent } from 'jrng-ui/mega-menu';
import { JBreadcrumbComponent } from 'jrng-ui/breadcrumb';
import { JTabsComponent, JTabComponent } from 'jrng-ui/tabs';
import { JAccordionComponent, JAccordionPanelComponent } from 'jrng-ui/accordion';
import { JStepperComponent } from 'jrng-ui/stepper';
import { JSidebarNavComponent } from 'jrng-ui/sidebar-nav';
import { JTopbarComponent } from 'jrng-ui/topbar';
```

## Menu

```ts
items: readonly JMenuItem[] = [
  { label: 'New project', icon: '+', command: () => this.createProject() },
  {
    label: 'Export',
    icon: '↓',
    items: [
      { label: 'Invoices' },
      { label: 'Orders' },
    ],
  },
  { separator: true },
  { label: 'Remove', disabled: true },
];
```

```html
<j-menu [model]="items" />
<j-menu #popup [model]="items" popup />
```

`j-menu` supports nested items, icons, separators, disabled items, roving tabindex, arrow-key navigation, typeahead, submenu open/close delay, popup mode, and a custom `#jMenuItem` template.

## Context Menu

```html
<section #target>Right-click a task</section>
<j-context-menu [target]="target" [model]="items" />
```

The context menu supports right-click, keyboard context menu shortcuts, target binding, and listener cleanup.

## Tiered Menu

```html
<j-tiered-menu [model]="items" popup [(visible)]="menuOpen" />
```

Use `j-tiered-menu` when nested menu behavior is the primary interaction.

## Menubar

```html
<j-menubar [model]="items" />
```

`j-menubar` renders a horizontal menu with submenu support and mobile collapse.

## Mega Menu

```html
<j-mega-menu [model]="megaItems" [columns]="3" />
```

Mega menu items can expose grouped columns:

```ts
megaItems = [
  {
    label: 'Products',
    groups: [
      { label: 'Catalog', items: [{ label: 'Products' }, { label: 'Categories' }] },
      { label: 'Sales', items: [{ label: 'Orders' }, { label: 'Invoices' }] },
    ],
  },
];
```

## Breadcrumb

```html
<j-breadcrumb [home]="home" [model]="trail">
  <ng-template #jBreadcrumbSeparator>›</ng-template>
</j-breadcrumb>
```

Breadcrumb items support `url`, `routerLink`, icons, disabled state, commands, a home item, and a separator template.

## Tabs

```html
<j-tabs [(selectedIndex)]="tabIndex" lazy scrollable>
  <j-tab header="Overview">Overview content</j-tab>
  <j-tab header="Tasks" closable>Task content</j-tab>
  <j-tab header="Invoices" disabled>Invoice content</j-tab>
</j-tabs>
```

Tabs support keyboard navigation, lazy panels, closable tabs, disabled tabs, and scrollable tab headers.

## Accordion

```html
<j-accordion [(activeIndex)]="activePanel" multiple>
  <j-accordion-panel header="Details">Details content</j-accordion-panel>
  <j-accordion-panel header="Activity">Activity content</j-accordion-panel>
</j-accordion>
```

## Stepper

```html
<j-stepper
  [items]="steps"
  [(activeIndex)]="activeStep"
  linear
  orientation="horizontal"
/>
```

Steps support linear mode, completed state, error state, disabled state, and horizontal or vertical layout.

## Sidebar Nav

```html
<j-sidebar-nav [model]="navItems" [(collapsed)]="sidebarCollapsed" activeKey="Orders">
  <strong jSidebarBrand>Workspace</strong>
</j-sidebar-nav>
```

`j-sidebar-nav` is a generic collapsible app sidebar with active item support and mobile-friendly layout.

## Topbar

```html
<j-topbar [model]="navItems" activeKey="Projects">
  <strong jTopbarBrand>Workspace</strong>
  <j-button jTopbarActions icon="search" />
</j-topbar>
```

`j-topbar` provides generic top navigation with projected brand and action areas.
