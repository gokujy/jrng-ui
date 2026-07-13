import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  input,
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
  readonly field = input.required<string>();
  readonly header = input('');
  readonly sortable = input(false);
  readonly filterable = input(false);
  readonly width = input('');
  readonly minWidth = input('');
  readonly align = input<JTableColumnAlign>('start');
  readonly type = input<JTableColumnType>('text');
  readonly visible = input(true);
  readonly frozen = input(false);
  readonly templateKey = input('');
  readonly actions = input<readonly JTableAction[]>([]);

  @ContentChild(TemplateRef) template?: TemplateRef<JColumnCellContext>;
}
