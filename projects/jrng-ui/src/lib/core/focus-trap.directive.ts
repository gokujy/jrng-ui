import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { jFocusableElements } from './focus';
import { J_KEY } from './keyboard';

@Directive({
  selector: '[jFocusTrap]',
})
export class JFocusTrapDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly documentRef = inject(DOCUMENT);

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key !== J_KEY.tab) {
      return;
    }

    const focusable = jFocusableElements(this.elementRef.nativeElement);

    if (!focusable.length) {
      event.preventDefault();
      this.elementRef.nativeElement.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && this.documentRef.activeElement === first) {
      event.preventDefault();
      last?.focus();
      return;
    }

    if (!event.shiftKey && this.documentRef.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
}
