import { Component } from '@angular/core';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JCardComponent } from 'jrng-ui/card';
import { JProgressBarComponent } from 'jrng-ui/progress-bar';

@Component({
  selector: 'app-card-metric-demo',
  imports: [JBadgeComponent, JCardComponent, JProgressBarComponent],
  templateUrl: './card-metric-demo.component.html',
  styleUrl: './card-metric-demo.component.scss',
})
export class CardMetricDemoComponent {
  readonly revenue = '$84,250';
  readonly targetProgress = 72;
}
