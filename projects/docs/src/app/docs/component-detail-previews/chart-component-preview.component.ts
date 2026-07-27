import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-chart-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS],
  template: `
    @let example = previewExample();
    @switch (doc().slug) {
      @case ('sparkline') {
        <div class="j-preview-row">
          <j-sparkline [value]="sparklineValues" ariaLabel="Revenue trend" />
          <j-sparkline [value]="sparklineValues" type="bar" ariaLabel="Volume trend" />
        </div>
      }
      @case ('chart') {
        <section class="j-live-chart-example">
          @switch (example.key) {
            @case ('line') {
              <strong>Daily active users</strong>
              <j-chart type="line" [data]="lineChartData" ariaLabel="Daily active users" />
            }
            @case ('doughnut') {
              <strong>Traffic sources</strong>
              <j-chart type="doughnut" [data]="doughnutChartData" ariaLabel="Traffic sources" />
            }
            @case ('mixed') {
              <strong>Revenue and target</strong>
              <j-chart type="mixed" [data]="mixedChartData" ariaLabel="Revenue and target" />
            }
            @default {
              <strong>Monthly signups</strong>
              <j-chart type="bar" [data]="chartData" ariaLabel="Monthly signups" />
            }
          }
        </section>
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
}
