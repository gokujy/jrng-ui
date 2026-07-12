import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { JChartComponent } from 'jrng-ui/chart';
import { JMetricCardComponent } from 'jrng-ui/metric-card';
import { JPageHeaderComponent } from 'jrng-ui/page-header';
import { JTableColumn, JTableComponent } from 'jrng-ui/table';
import { MockAdminApiService } from '../services/mock-admin-api.service';

@Component({
  selector: 'admin-dashboard-page',
  imports: [JChartComponent, JMetricCardComponent, JPageHeaderComponent, JTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="admin-page">
    <j-page-header title="Dashboard" description="A responsive overview of current operations." />
    <section class="admin-metrics">
      @for (metric of api.metrics; track metric.title) {
        <j-metric-card
          [title]="metric.title"
          [value]="metric.value"
          [trendLabel]="metric.trend"
          trend="up"
        />
      }
    </section>
    <section class="admin-grid">
      <article class="admin-panel admin-chart">
        <h2>Weekly activity</h2>
        <j-chart type="line" [data]="chartData" ariaLabel="Weekly activity" />
      </article>
      <article class="admin-panel">
        <h2>Recent activity</h2>
        <ul class="admin-activity">
          @for (item of api.activity; track item.id) {
            <li>
              <strong>{{ item.title }}</strong
              ><span>{{ item.detail }}</span
              ><small>{{ item.occurredAt }}</small>
            </li>
          }
        </ul>
      </article>
    </section>
    <article class="admin-panel">
      <h2>Recent users</h2>
      <j-table [value]="api.users()" [columns]="columns" [paginator]="false" />
    </article>
  </div>`,
})
export class DashboardPage {
  readonly api = inject(MockAdminApiService);
  readonly columns: readonly JTableColumn[] = [
    { field: 'name', header: 'Name' },
    { field: 'email', header: 'Email' },
    { field: 'role', header: 'Role' },
    { field: 'status', header: 'Status' },
  ];
  readonly chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Completed requests',
        data: [32, 45, 41, 58, 64, 52, 71],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79,70,229,.14)',
        fill: true,
        tension: 0.35,
      },
    ],
  };
}
