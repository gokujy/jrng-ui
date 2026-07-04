import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { jTrapFocus } from './focus';

@Directive({
  selector: '[jFocusTrap]',
})
export class JFocusTrapDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly documentRef = inject(DOCUMENT);

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    jTrapFocus(event, this.elementRef.nativeElement, this.documentRef);
  }
}
