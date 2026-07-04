# Chart And Visualization Components

jrng-ui includes generic visualization components for dashboards and reporting surfaces. Lightweight components are dependency-free. `j-chart` uses Chart.js through an SSR-safe dynamic import and Chart.js is an optional peer dependency.

## Optional Chart Dependency

Install Chart.js only when using `j-chart`.

```sh
npm install chart.js
```

The jrng-ui package marks `chart.js` as an optional peer dependency, so applications that do not use charts do not need to install it.

## Chart

```ts
import { JChartComponent } from 'jrng-ui/chart';

readonly chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  datasets: [
    {
      label: 'Orders',
      data: [32, 48, 41, 64],
    },
  ],
};
```

```html
<j-chart
  type="bar"
  [data]="chartData"
  [options]="chartOptions"
  ariaLabel="Order volume chart"
  (chartClick)="onChartClick($event)"
  (chartHover)="onChartHover($event)"
/>
```

Supported chart types are `bar`, `line`, `pie`, `doughnut`, `radar`, `polarArea`, `scatter`, `bubble`, and `mixed`. For mixed charts, set per-dataset Chart.js types in the dataset config.

`j-chart` accepts `type`, `data`, `options`, `plugins`, `width`, `height`, `responsive`, `loading`, `emptyMessage`, `ariaLabel`, and `styleClass`. Default dataset colors are derived from JRNG design tokens when colors are not supplied.

Use the component instance methods for imperative work:

```ts
chart.refresh();
chart.resize();
const image = chart.exportImage();
```

## Sparkline

`j-sparkline` renders small inline line or bar charts without external dependencies.

```ts
import { JSparklineComponent } from 'jrng-ui/sparkline';

readonly trend = [4, 8, 6, 12, 9, 15];
```

```html
<j-sparkline [value]="trend" type="line" ariaLabel="Project trend" />
<j-sparkline [value]="trend" type="bar" ariaLabel="Task activity" />
```

Sparkline colors use positive and negative token values through `--j-sparkline-positive-color` and `--j-sparkline-negative-color`.

## Meter Group

Use `j-meter-group` for grouped progress or capacity values.

```ts
import { JMeterGroupComponent, JMeterGroupItem } from 'jrng-ui/meter-group';

readonly meters: JMeterGroupItem[] = [
  { label: 'Completed', value: 72, severity: 'success' },
  { label: 'In review', value: 18, severity: 'warning' },
  { label: 'Blocked', value: 6, severity: 'danger' },
];
```

```html
<j-meter-group [value]="meters" [max]="100" />
```

Each item supports `label`, `value`, optional `max`, and optional `severity`.

## Stat Card

```ts
import { JStatCardComponent } from 'jrng-ui/stat-card';
```

```html
<j-stat-card
  title="Orders"
  [value]="1280"
  trend="up"
  trendLabel="12% increase"
  icon="chart"
  footer="Compared with previous period"
/>
```

`j-stat-card` supports `title`, `value`, `trend`, `trendLabel`, `icon`, `footer`, `loading`, and `styleClass`.

## Metric Card

```ts
import { JMetricCardComponent } from 'jrng-ui/metric-card';
```

```html
<j-metric-card
  title="Revenue"
  value="$42,800"
  trend="neutral"
  trendLabel="On target"
  icon="metric"
  footer="Updated today"
/>
```

`j-metric-card` uses a stronger dashboard presentation for key metrics and supports the same core inputs as `j-stat-card`.

## Design Rules

Use generic examples such as User, Product, Customer, Order, Invoice, Project, Task, and Team. Do not copy Chart.js examples, external UI library CSS, markup, naming, or visual design. Component selectors use the `j-*` prefix and CSS classes use the `.j-*` prefix.
