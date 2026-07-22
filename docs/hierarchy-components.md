# Hierarchy Components

jrng-ui includes generic hierarchy and timeline components for enterprise Angular applications. The components are standalone, framework-independent, and styled with JRNG design tokens.

## Tree

Use `j-tree` for nested Project, Task, Team, Product, or Customer navigation.

```ts
import { JTreeComponent, JTreeNode } from 'jrng-ui/tree';

readonly projectNodes: JTreeNode[] = [
  {
    key: 'project-platform',
    label: 'Project Platform',
    icon: 'folder',
    children: [
      { key: 'task-design', label: 'Design review', icon: 'file' },
      { key: 'task-release', label: 'Release checklist', icon: 'file' },
    ],
  },
  {
    key: 'project-operations',
    label: 'Project Operations',
    children: [{ key: 'task-invoices', label: 'Invoice audit' }],
  },
];
```

```html
<j-tree
  [value]="projectNodes"
  selectionMode="checkbox"
  [(selection)]="selectedNodes"
  filter
  (nodeExpand)="loadChildren($event)"
/>
```

Features include nested nodes, expand and collapse, single, multiple, and checkbox selection, lazy loading events, icons, disabled nodes, filtering, keyboard navigation, and ARIA tree semantics.

## Tree Table

Use `j-tree-table` when hierarchical rows need columns.

```ts
import { JTreeTableComponent } from 'jrng-ui/tree-table';
import { JTableColumn } from 'jrng-ui/table';
import { JTreeNode } from 'jrng-ui/tree';

readonly columns: JTableColumn[] = [
  { field: 'label', header: 'Name', sortable: true },
  { field: 'owner', header: 'Owner', sortable: true },
  { field: 'status', header: 'Status' },
];

readonly rows: JTreeNode[] = [
  {
    key: 'team-design',
    label: 'Design Team',
    data: { owner: 'User', status: 'Active' },
    children: [
      { key: 'task-brand', label: 'Brand update', data: { owner: 'Customer', status: 'In review' } },
    ],
  },
];
```

```html
<j-tree-table
  [value]="rows"
  [columns]="columns"
  selectionMode="checkbox"
  [(selection)]="selectedRows"
  filter
  (sortChange)="onSort($event)"
  (lazyLoad)="loadRows($event)"
/>
```

Tree table supports tree rows, columns, expand and collapse, lazy loading, selection, filtering, sorting, and custom cell templates with `#jTreeTableCell`.

## Timeline

Use `j-timeline` to show generic Order, Invoice, Project, or Task history.

```ts
import { JTimelineComponent, JTimelineItem } from 'jrng-ui/timeline';

readonly orderEvents: JTimelineItem[] = [
  { title: 'Order created', content: 'A new order was submitted.', opposite: 'Today', severity: 'info' },
  { title: 'Receipt issued', content: 'The receipt is ready for the account.', opposite: 'Today', severity: 'success' },
];
```

```html
<j-timeline [value]="orderEvents" variant="activity" collapsible>
  <ng-template #jTimelineContent let-item>
    <strong>{{ item.title }}</strong>
    <p>{{ item.content }}</p>
  </ng-template>
</j-timeline>

<j-timeline [value]="milestones" layout="horizontal" compact />

<j-timeline [value]="[]" emptyTitle="No deployment events" />

<j-timeline [value]="[]" [loading]="true" loadingLabel="Loading deployment history" />
```

Timeline supports vertical, horizontal, activity, and alternating layouts; opposite content; JRNG icon markers; collapsible keyboard-accessible detail; custom templates; loading, empty, and error states; responsive stacking; RTL; and reduced-motion-safe presentation.

## Org Chart

Use `j-org-chart` to render generic Team, Project, or Customer account structures.

```ts
import { JOrgChartComponent, JOrgChartNode } from 'jrng-ui/org-chart';

readonly teamChart: JOrgChartNode = {
  key: 'team-root',
  label: 'Team',
  type: 'Group',
  children: [
    { key: 'team-product', label: 'Product', type: 'Department' },
    { key: 'team-support', label: 'Support', type: 'Department', expanded: false },
  ],
};
```

```html
<j-org-chart [value]="teamChart" orientation="vertical" />

<ng-template #jOrgChartNode let-node>
  <strong>{{ node.label }}</strong>
  <small>{{ node.type }}</small>
</ng-template>
```

Org chart supports hierarchical nodes, vertical and horizontal orientation, custom node templates, and collapsible branches.

## Accessibility

Tree uses the ARIA tree pattern. Tree table uses treegrid semantics. Interactive controls expose expanded, selected, disabled, focused, and open state through ARIA and `data-j-*` attributes where appropriate.

## Design Rules

Use only generic examples such as User, Product, Customer, Order, Invoice, Project, Task, and Team. Do not copy CSS, markup, naming, or visual design from any external UI library. Component selectors use the `j-*` prefix and CSS classes use the `.j-*` prefix.
