import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JChartComponent } from 'jrng-ui/chart';
import { JIconComponent } from 'jrng-ui/icon';
import { JSkeletonComponent } from 'jrng-ui/skeleton';
import { CodeBlockComponent } from './code-block.component';
import {
  chartDataCode,
  chartEvents,
  chartInputs,
  chartInstallCode,
  chartOptionsCode,
  chartTypeDocs,
} from './chart-docs.data';

@Component({
  selector: 'app-charts-docs-page',
  imports: [RouterLink, CodeBlockComponent, JChartComponent, JIconComponent, JSkeletonComponent],
  template: `
    <section class="j-page-hero j-page-hero--docs">
      <span class="j-page-eyebrow">Charts</span>
      <h1>Charts Documentation</h1>
      <p>
        JRNG charts wrap Chart.js in an Angular component with theme-aware colors, loading and empty
        states, responsive behavior, and interaction events.
      </p>
      <div class="j-doc-hero-links">
        <a routerLink="/docs/components"><j-icon name="boxes" /> Components</a>
        <a routerLink="/docs"><j-icon name="book-open" /> Getting started</a>
      </div>
    </section>

    <section class="j-chart-doc-layout">
      <aside class="j-doc-topic-nav" aria-label="Chart sections">
        <a href="/docs/charts#overview"><j-icon name="info" /> Overview</a>
        <a href="/docs/charts#examples"><j-icon name="chart-no-axes-column" /> Examples</a>
        <a href="/docs/charts#data"><j-icon name="code-xml" /> Data format</a>
        <a href="/docs/charts#api"><j-icon name="settings" /> API</a>
        <a href="/docs/charts#states"><j-icon name="loader-circle" /> States</a>
        <a href="/docs/charts#best-practices"><j-icon name="lightbulb" /> Best practices</a>
      </aside>

      <main class="j-chart-doc-content">
        <section id="overview" class="j-doc-section-card">
          <div class="j-section-heading">
            <span class="j-page-eyebrow">Overview</span>
            <h2>Use charts for readable data stories</h2>
          </div>
          <p>
            The chart component accepts Chart.js-compatible data and options. JRNG supplies
            theme-aware default colors, responsive configuration, built-in loading and empty states,
            and click/hover outputs.
          </p>
          <div class="j-callout">
            <j-icon name="triangle-alert" />
            <div>
              <strong>Renderer dependency</strong>
              <p>
                The library keeps Chart.js as an optional peer dependency. Install it in the
                consuming app when rendering live charts.
              </p>
            </div>
          </div>
          <app-code-block label="Install Chart.js" [code]="chartInstallCode" />
        </section>

        <section id="examples" class="j-doc-section-card">
          <div class="j-section-heading">
            <span class="j-page-eyebrow">Preview</span>
            <h2>Chart type examples</h2>
          </div>

          <div class="j-doc-tabs" role="tablist" aria-label="Charts preview and code">
            <button
              type="button"
              [class.is-active]="activeTab() === 'preview'"
              (click)="activeTab.set('preview')"
            >
              <j-icon name="component" />
              Preview
            </button>
            <button
              type="button"
              [class.is-active]="activeTab() === 'code'"
              (click)="activeTab.set('code')"
            >
              <j-icon name="code-xml" />
              Code
            </button>
          </div>

          @if (activeTab() === 'preview') {
            <div class="j-chart-preview-grid">
              <article class="j-chart-example">
                <header><h3>Bar chart</h3></header>
                <p>Best for comparing categories.</p>
                <j-chart
                  type="bar"
                  [data]="barData"
                  [options]="barOptions"
                  ariaLabel="Revenue by quarter"
                />
              </article>
              <article class="j-chart-example">
                <header><h3>Line chart</h3></header>
                <p>Best for trends over time.</p>
                <j-chart
                  type="line"
                  [data]="lineData"
                  [options]="lineOptions"
                  ariaLabel="Weekly signups"
                />
              </article>
              <article class="j-chart-example">
                <header><h3>Pie chart</h3></header>
                <p>Use sparingly for simple part-to-whole data.</p>
                <j-chart
                  type="pie"
                  [data]="segmentData"
                  [options]="segmentOptions"
                  ariaLabel="Plan share"
                />
              </article>
              <article class="j-chart-example">
                <header><h3>Donut chart</h3></header>
                <p>Useful for compact summaries with a legend.</p>
                <j-chart
                  type="doughnut"
                  [data]="segmentData"
                  [options]="segmentOptions"
                  ariaLabel="Plan share donut"
                />
              </article>
              <article class="j-chart-example">
                <header><h3>Area chart</h3></header>
                <p>A line chart with filled volume.</p>
                <j-chart
                  type="line"
                  [data]="areaData"
                  [options]="areaOptions"
                  ariaLabel="Usage volume"
                />
              </article>
              <article class="j-chart-example">
                <header><h3>Scatter chart</h3></header>
                <p>Best for x/y relationships and outliers.</p>
                <j-chart
                  type="scatter"
                  [data]="scatterData"
                  [options]="scatterOptions"
                  ariaLabel="Cost and conversion scatter"
                />
              </article>
            </div>
          } @else {
            <div class="j-code-grid">
              @for (chart of chartTypeDocs; track chart.type) {
                <app-code-block [label]="chart.title" [code]="chart.code" />
              }
            </div>
          }
        </section>

        <section id="data" class="j-doc-section-card">
          <div class="j-section-heading">
            <span class="j-page-eyebrow">Data</span>
            <h2>Data format and options</h2>
          </div>
          <p>
            Pass the same shape that Chart.js expects: labels plus one or more datasets. Long labels
            should be shortened, wrapped in your source data, or handled with tick auto-skip in
            options.
          </p>
          <div class="j-two-column">
            <app-code-block label="Data examples" [code]="chartDataCode" />
            <app-code-block label="Tooltip and legend options" [code]="chartOptionsCode" />
          </div>
        </section>

        <section class="j-doc-section-card">
          <div class="j-section-heading">
            <span class="j-page-eyebrow">Types</span>
            <h2>When to use each chart</h2>
          </div>
          <div class="j-chart-type-list">
            @for (chart of chartTypeDocs; track chart.type) {
              <article>
                <header>
                  <h3>{{ chart.title }}</h3>
                </header>
                <p>{{ chart.description }}</p>
                <ul>
                  @for (item of chart.whenToUse; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
                @if (chart.avoid?.length) {
                  <strong>When to avoid</strong>
                  <ul>
                    @for (item of chart.avoid; track item) {
                      <li>{{ item }}</li>
                    }
                  </ul>
                }
              </article>
            }
          </div>
        </section>

        <section id="api" class="j-doc-section-card">
          <div class="j-section-heading">
            <span class="j-page-eyebrow">API</span>
            <h2>Props and events</h2>
          </div>
          <h3>Props / Inputs</h3>
          <div class="j-table-wrap">
            <table class="j-api-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                @for (row of chartInputs; track row.name) {
                  <tr>
                    <td>
                      <code>{{ row.name }}</code>
                    </td>
                    <td>{{ row.type }}</td>
                    <td>
                      <code>{{ row.defaultValue }}</code>
                    </td>
                    <td>{{ row.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <h3>Events / Outputs</h3>
          <div class="j-table-wrap">
            <table class="j-api-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Payload</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                @for (row of chartEvents; track row.event) {
                  <tr>
                    <td>
                      <code>{{ row.event }}</code>
                    </td>
                    <td>{{ row.payload }}</td>
                    <td>{{ row.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>

        <section id="states" class="j-doc-section-card">
          <div class="j-section-heading">
            <span class="j-page-eyebrow">States</span>
            <h2>Loading, empty, no data, and renderer errors</h2>
          </div>
          <div class="j-chart-preview-grid j-chart-preview-grid--states">
            <article class="j-chart-example">
              <header><h3>Loading</h3></header>
              <j-chart type="bar" [data]="barData" loading ariaLabel="Loading chart" />
            </article>
            <article class="j-chart-example">
              <header><h3>Empty</h3></header>
              <j-chart
                type="bar"
                [data]="emptyChartData"
                emptyMessage="No revenue data yet."
                ariaLabel="Empty chart"
              />
            </article>
            <article class="j-chart-example">
              <header><h3>Skeleton wrapper</h3></header>
              <div class="j-chart-state-frame">
                <j-skeleton variant="card" />
              </div>
            </article>
          </div>
          <ul class="j-doc-list">
            <li>Use <code>loading</code> while fetching data.</li>
            <li>Pass an empty labels or datasets array to show the empty message.</li>
            <li>
              If Chart.js is not installed, the component shows a renderer error state instead of
              crashing.
            </li>
          </ul>
        </section>

        <section id="best-practices" class="j-doc-section-card">
          <div class="j-section-heading">
            <span class="j-page-eyebrow">Guidance</span>
            <h2>Responsive behavior and best practices</h2>
          </div>
          <div class="j-doc-grid-sections">
            <div class="j-doc-section-block">
              <h3>Mobile</h3>
              <ul>
                <li>
                  Leave <code>responsive</code> enabled unless a fixed export size is required.
                </li>
                <li>Keep x-axis labels short and use <code>autoSkip</code> for dense timelines.</li>
                <li>Prefer horizontal bars or tables when category labels are long.</li>
              </ul>
            </div>
            <div class="j-doc-section-block">
              <h3>Tooltip and legend</h3>
              <ul>
                <li>Place legends at the bottom for narrow screens.</li>
                <li>Use tooltip callbacks to format currency, percentages, and units.</li>
                <li>Do not rely only on color; labels and legends should explain each series.</li>
              </ul>
            </div>
            <div class="j-doc-section-block">
              <h3>Choosing charts</h3>
              <ul>
                <li>Use bar charts for category comparison.</li>
                <li>Use line or area charts for trends.</li>
                <li>Avoid pie charts when there are many categories or close values.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartsDocsPageComponent {
  readonly activeTab = signal<'preview' | 'code'>('preview');
  readonly chartTypeDocs = chartTypeDocs;
  readonly chartInputs = chartInputs;
  readonly chartEvents = chartEvents;
  readonly chartInstallCode = chartInstallCode;
  readonly chartDataCode = chartDataCode;
  readonly chartOptionsCode = chartOptionsCode;

  readonly barData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{ label: 'Revenue', data: [42, 58, 64, 73] }],
  };

  readonly lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ label: 'Signups', data: [18, 24, 21, 36, 42, 38, 51] }],
  };

  readonly areaData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ label: 'Usage', data: [120, 180, 240, 310, 420, 520], fill: true, tension: 0.35 }],
  };

  readonly segmentData = {
    labels: ['Starter', 'Pro', 'Enterprise'],
    datasets: [{ label: 'Customers', data: [48, 36, 16] }],
  };

  readonly scatterData = {
    datasets: [
      {
        label: 'Campaigns',
        data: [
          { x: 12, y: 22 },
          { x: 18, y: 34 },
          { x: 24, y: 31 },
          { x: 32, y: 48 },
          { x: 46, y: 55 },
        ],
      },
    ],
  };

  readonly emptyChartData = { labels: [], datasets: [] };

  readonly barOptions = {
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } },
  };

  readonly lineOptions = {
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } },
  };

  readonly areaOptions = {
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } },
  };

  readonly segmentOptions = {
    plugins: { legend: { position: 'bottom' } },
  };

  readonly scatterOptions = {
    plugins: { legend: { position: 'bottom' } },
    scales: {
      x: { title: { display: true, text: 'Cost' } },
      y: { title: { display: true, text: 'Conversion' } },
    },
  };
}
