import { Directive, TemplateRef, inject, input } from '@angular/core';
import { JTableCellContext, JTableHeaderContext } from './table.types';

@Directive({
  selector: 'ng-template[jTableCell]',
})
export class JTableCellTemplateDirective {
  readonly templateRef = inject<TemplateRef<JTableCellContext>>(TemplateRef);

  readonly key = input('', { alias: 'jTableCell' });
}

@Directive({
  selector: 'ng-template[jTableHeader]',
})
export class JTableHeaderTemplateDirective {
  readonly templateRef = inject<TemplateRef<JTableHeaderContext>>(TemplateRef);

  readonly key = input('', { alias: 'jTableHeader' });
}
