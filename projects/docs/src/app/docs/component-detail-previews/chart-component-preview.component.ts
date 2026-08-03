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
          <j-sparkline [value]="sparklineValues" ariaLabel="Customer growth trend" />
          <j-sparkline [value]="sparklineValues" type="bar" ariaLabel="Active customer trend" />
        </div>
      }
      @case ('chart') {
        <section class="j-live-chart-example">
          @switch (example.key) {
            @case ('line') {
              <strong>Daily active customers</strong>
              <j-chart type="line" [data]="lineChartData" ariaLabel="Daily active customers" />
            }
            @case ('pie') {
              <strong>Customer segments with labels</strong>
              <j-chart
                type="pie"
                [data]="doughnutChartData"
                [outsideLabels]="outsideLabelOptions"
                ariaLabel="Customer segments"
              />
            }
            @case ('doughnut') {
              <strong>Customer segments</strong>
              <j-chart type="doughnut" [data]="doughnutChartData" ariaLabel="Customer segments" />
            }
            @case ('radar') {
              <strong>Capability comparison</strong>
              <j-chart type="radar" [data]="radarChartData" ariaLabel="Capability comparison" />
            }
            @case ('polar-area') {
              <strong>Orders by channel</strong>
              <j-chart type="polarArea" [data]="polarChartData" ariaLabel="Orders by channel" />
            }
            @case ('scatter') {
              <strong>Campaign cost and conversion</strong>
              <j-chart
                type="scatter"
                [data]="scatterChartData"
                ariaLabel="Campaign cost and conversion"
              />
            }
            @case ('bubble') {
              <strong>Campaign cost, conversion, and volume</strong>
              <j-chart
                type="bubble"
                [data]="bubbleChartData"
                ariaLabel="Campaign cost conversion and volume"
              />
            }
            @case ('mixed') {
              <strong>Revenue and target</strong>
              <j-chart type="mixed" [data]="mixedChartData" ariaLabel="Revenue and target" />
            }
            @default {
              <strong>Monthly customer growth</strong>
              <j-chart type="bar" [data]="chartData" ariaLabel="Monthly customer growth" />
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
