import { Directive, Input, TemplateRef, inject } from '@angular/core';
import { JTableCellContext, JTableHeaderContext } from './table.types';

@Directive({
  selector: 'ng-template[jTableCell]',
})
export class JTableCellTemplateDirective {
  readonly templateRef = inject<TemplateRef<JTableCellContext>>(TemplateRef);

  @Input('jTableCell') key = '';
}

@Directive({
  selector: 'ng-template[jTableHeader]',
})
export class JTableHeaderTemplateDirective {
  readonly templateRef = inject<TemplateRef<JTableHeaderContext>>(TemplateRef);

  @Input('jTableHeader') key = '';
}
