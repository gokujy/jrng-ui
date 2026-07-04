import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JTransferListComponent } from '../transfer-list/transfer-list.component';

@Component({
  selector: 'j-pick-list',
  imports: [JTransferListComponent],
  template: `
    <j-transfer-list
      [source]="source"
      [target]="target"
      [optionLabel]="optionLabel"
      [optionValue]="optionValue"
      [optionDisabled]="optionDisabled"
      [sourceHeader]="sourceHeader"
      [targetHeader]="targetHeader"
      [filter]="filter"
      (sourceChange)="sourceChange.emit($event)"
      (targetChange)="targetChange.emit($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JPickListComponent extends JTransferListComponent {}
