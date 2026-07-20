# Layout And Page Components

jrng-ui includes generic application layout components and React-style composition blocks for dashboards, auth screens, settings pages, and empty or error states.

## App Shell

`j-app-shell` provides header, sidebar, content, and footer regions with responsive mobile overlay behavior.

```ts
import { JAppShellComponent } from 'jrng-ui/app-shell';
```

```html
<j-app-shell [(sidebarCollapsed)]="collapsed" [(sidebarOpen)]="sidebarOpen">
  <div jShellHeader>Product Dashboard</div>
  <nav jShellSidebar>Navigation</nav>
  <main>Page content</main>
  <div jShellFooter>Footer content</div>
</j-app-shell>
```

## Page Header

`j-page-header` supports title, description, breadcrumbs, actions, and tabs slot.

```ts
import { JPageHeaderBreadcrumb, JPageHeaderComponent } from 'jrng-ui/page-header';

readonly breadcrumbs: JPageHeaderBreadcrumb[] = [
  { label: 'Projects', url: '/projects' },
  { label: 'Tasks' },
];
```

```html
<j-page-header title="Tasks" subtitle="Track project work." [breadcrumbs]="breadcrumbs">
  <div jPageActions>
    <j-button label="New task" />
  </div>
  <div jPageTabs>
    <j-tabs [tabs]="tabs" />
  </div>
</j-page-header>
```

## Section Header And Footer

```html
<j-section-header title="Orders" description="Review recent orders.">
  <j-button label="Export" variant="outline" />
</j-section-header>

<j-section-footer>
  <span>Showing 20 orders</span>
  <j-button label="Next" />
</j-section-footer>
```

## Auth Layout

`j-auth-layout` supports split and centered authentication layouts.

```html
<j-auth-layout variant="split">
  <aside jAuthAside>Welcome content</aside>
  <form>Sign in form</form>
</j-auth-layout>

<j-auth-layout variant="centered">
  <form>Create account form</form>
</j-auth-layout>
```

## Layout Primitives

Use `j-container`, `j-grid`, and `j-grid-layout` with JRNG flex utilities to compose pages.

Use `j-grid`, `j-row`, and `j-col` when the layout needs explicit responsive spans,
offsets, ordering, alignment, or gutters. This is a presentation grid, not a data table.

```ts
import { JGridColumnComponent, JGridComponent, JGridRowComponent } from 'jrng-ui/grid';
```

```html
<j-grid fixed>
  <j-row>
    <j-col size="12" md="8">Main content</j-col>
    <j-col size="12" md="4">Sidebar</j-col>
  </j-row>
</j-grid>
```

The breakpoint inputs are mobile-first: `size`, `sm`, `md`, `lg`, `xl`, and `xxl`.
Omit a size for an equal-width column, use `auto` for intrinsic width, and use the
matching `offset*` or `order*` input only when the layout genuinely requires it.

`j-grid-layout` remains the simpler choice for an automatic collection of repeated
items whose minimum width determines wrapping:

```html
<j-container size="xl">
  <div class="j-flex j-flex-column j-gap-5">
    <j-page-header title="Customers" subtitle="Manage customer records." />
    <j-grid-layout [columns]="3" minItemWidth="18rem">
      <j-card title="Customer activity" />
      <j-card title="Invoices" />
      <j-card title="Orders" />
    </j-grid-layout>
  </div>
</j-container>
```

## Sidebar compositions

```html
<j-grid>
  <j-row>
    <j-col size="12" lg="3"><j-panel header="Filters">Filter content</j-panel></j-col>
    <j-col size="12" lg="9">Results</j-col>
  </j-row>
</j-grid>

<j-drawer [(visible)]="filtersOpen" title="Filters">Filter content</j-drawer>
```

## Splitter

`j-splitter` arranges projected panes horizontally or vertically.

```html
<j-splitter orientation="horizontal" [gutterSize]="12">
  <section>List</section>
  <section>Detail</section>
</j-splitter>
```

## Generic Page States

```html
<j-error-page code="404" title="Page not found" description="The requested page is unavailable.">
  <j-button label="Go back" />
</j-error-page>

<j-empty
  variant="page"
  icon="empty"
  title="No projects"
  description="Create a project to get started."
>
  <j-button label="New project" />
</j-empty>

<j-maintenance-page detail="Try again later.">
  <j-button label="Refresh" />
</j-maintenance-page>
```

## Design Rules

Use generic examples such as User, Product, Customer, Order, Invoice, Project, Task, and Team. Component selectors use the `j-*` prefix and CSS classes use the `.j-*` prefix. Do not copy source code, CSS, docs, examples, naming, or exact visual design from external UI libraries.
