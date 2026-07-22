/* eslint-disable @typescript-eslint/no-unused-vars -- template guards require the predicate parameter name */
import { Directive, TemplateRef, inject, input } from '@angular/core';
import {
  JTableCellContext,
  JTableColumn,
  JTableEmptyContext,
  JTableFilterContext,
  JTableHeaderContext,
  JTableLoadingContext,
  JTableRow,
} from './table.types';

type JTableTemplateKey<T extends object> = string | JTableColumn<T>;

@Directive({
  selector: 'ng-template[jTableCell]',
})
export class JTableCellTemplateDirective<T extends object = JTableRow> {
  readonly templateRef = inject<TemplateRef<JTableCellContext<T>>>(TemplateRef);

  readonly key = input<JTableTemplateKey<T>>('', { alias: 'jTableCell' });

  resolvedKey(): string {
    const key = this.key();
    return typeof key === 'string' ? key : key.templateKey || key.field;
  }

  static ngTemplateContextGuard<T extends object>(
    _directive: JTableCellTemplateDirective<T>,
    context: unknown,
  ): context is JTableCellContext<T> {
    return true;
  }
}

@Directive({
  selector: 'ng-template[jTableHeader]',
})
export class JTableHeaderTemplateDirective<T extends object = JTableRow> {
  readonly templateRef = inject<TemplateRef<JTableHeaderContext<T>>>(TemplateRef);

  readonly key = input<JTableTemplateKey<T>>('', { alias: 'jTableHeader' });

  resolvedKey(): string {
    const key = this.key();
    return typeof key === 'string' ? key : key.templateKey || key.field;
  }

  static ngTemplateContextGuard<T extends object>(
    _directive: JTableHeaderTemplateDirective<T>,
    context: unknown,
  ): context is JTableHeaderContext<T> {
    return true;
  }
}

@Directive({
  selector: 'ng-template[jTableFilter]',
})
export class JTableFilterTemplateDirective<T extends object = JTableRow> {
  readonly templateRef = inject<TemplateRef<JTableFilterContext<T>>>(TemplateRef);
  readonly key = input<JTableTemplateKey<T>>('', { alias: 'jTableFilter' });

  resolvedKey(): string {
    const key = this.key();
    return typeof key === 'string' ? key : key.templateKey || key.field;
  }

  static ngTemplateContextGuard<T extends object>(
    _directive: JTableFilterTemplateDirective<T>,
    context: unknown,
  ): context is JTableFilterContext<T> {
    return true;
  }
}

@Directive({
  selector: 'ng-template[jTableActions]',
})
export class JTableActionsTemplateDirective<T extends object = JTableRow> {
  readonly templateRef = inject<TemplateRef<JTableCellContext<T>>>(TemplateRef);
  readonly key = input<JTableTemplateKey<T>>('', { alias: 'jTableActions' });

  resolvedKey(): string {
    const key = this.key();
    return typeof key === 'string' ? key : key.templateKey || key.field;
  }

  static ngTemplateContextGuard<T extends object>(
    _directive: JTableActionsTemplateDirective<T>,
    context: unknown,
  ): context is JTableCellContext<T> {
    return true;
  }
}

@Directive({
  selector: 'ng-template[jTableEmpty]',
})
export class JTableEmptyTemplateDirective {
  readonly templateRef = inject<TemplateRef<JTableEmptyContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: JTableEmptyTemplateDirective,
    context: unknown,
  ): context is JTableEmptyContext {
    return true;
  }
}

@Directive({
  selector: 'ng-template[jTableLoading]',
})
export class JTableLoadingTemplateDirective {
  readonly templateRef = inject<TemplateRef<JTableLoadingContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: JTableLoadingTemplateDirective,
    context: unknown,
  ): context is JTableLoadingContext {
    return true;
  }
}
