import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TABLE_SCENARIO_COMPONENTS } from './table-scenarios.generated';

@Component({
  selector: 'app-table-scenario-host',
  imports: [NgComponentOutlet],
  templateUrl: './table-scenarios.component.html',
  styleUrl: './table-scenarios.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableScenarioHostComponent {
  readonly scenario = input.required<string>();
  readonly component = computed(() => TABLE_SCENARIO_COMPONENTS[this.scenario()] ?? null);
  readonly componentInputs = computed(() => ({ scenario: this.scenario() }));
}
