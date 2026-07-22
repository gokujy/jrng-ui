/* eslint-disable @typescript-eslint/no-unused-vars -- template guards require the predicate parameter name */
import { Directive, TemplateRef, inject } from '@angular/core';
import { JTableColumn } from 'jrng-ui/table';
import { JTreeNode } from 'jrng-ui/tree';

export interface JTreeTableCellContext<T extends object = Record<string, unknown>> {
  readonly $implicit: JTreeNode<T>;
  readonly node: JTreeNode<T>;
  readonly column: JTableColumn<T>;
  readonly value: unknown;
  readonly level: number;
  readonly selected: boolean;
  readonly expanded: boolean;
  readonly partial: boolean;
}

@Directive({
  selector: 'ng-template[jTreeTableCell]',
})
export class JTreeTableCellTemplateDirective<T extends object = Record<string, unknown>> {
  readonly templateRef = inject<TemplateRef<JTreeTableCellContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T extends object>(
    _directive: JTreeTableCellTemplateDirective<T>,
    context: unknown,
  ): context is JTreeTableCellContext<T> {
    return true;
  }
}
