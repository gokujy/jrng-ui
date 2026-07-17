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
/**
 * @deprecated Prefer the strongly typed `JTableColumn<T>` configuration model.
 * This non-visual compatibility component remains available for projected-column usage.
 */
export class JColumnComponent {
  readonly field = input.required<string>();
  readonly header = input('');
  readonly sortable = input(false);
  readonly filterable = input(false);
  readonly width = input('');
  readonly minWidth = input('');
  readonly maxWidth = input('');
  readonly align = input<JTableColumnAlign>('start');
  readonly headerAlign = input<JTableColumnAlign>('start');
  readonly type = input<JTableColumnType>('text');
  readonly visible = input(true);
  readonly hidden = input(false);
  readonly frozen = input(false);
  readonly frozenAlign = input<'left' | 'right'>('left');
  readonly resizable = input(false);
  readonly reorderable = input(false);
  readonly templateKey = input('');
  readonly actions = input<readonly JTableAction[]>([]);
  readonly valueGetter = input<((row: JTableRow) => unknown) | null>(null);
  readonly formatter = input<((value: unknown, row: JTableRow) => string) | null>(null);

  @ContentChild(TemplateRef) template?: TemplateRef<JColumnCellContext>;
}
