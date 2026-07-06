import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Input,
  TemplateRef,
} from '@angular/core';
import { JTableAction, JTableColumnAlign, JTableColumnType, JTableRow } from './table.types';

export interface JColumnCellContext {
  readonly $implicit: JTableRow;
  readonly row: JTableRow;
  readonly value: unknown;
  readonly index: number;
}

@Component({
  selector: 'j-column',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JColumnComponent {
  @Input({ required: true }) field = '';
  @Input() header = '';
  @Input() sortable = false;
  @Input() filterable = false;
  @Input() width = '';
  @Input() minWidth = '';
  @Input() align: JTableColumnAlign = 'start';
  @Input() type: JTableColumnType = 'text';
  @Input() visible = true;
  @Input() frozen = false;
  @Input() templateKey = '';
  @Input() actions: readonly JTableAction[] = [];

  @ContentChild(TemplateRef) template?: TemplateRef<JColumnCellContext>;
}
