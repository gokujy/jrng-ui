import { AfterViewInit, Directive, ElementRef, inject, Input } from '@angular/core';
import { jCoerceBoolean } from './coercion';

@Directive({
  selector: '[jAutoFocus]',
})
export class JAutoFocusDirective implements AfterViewInit {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input() jAutoFocus: boolean | string = true;

  ngAfterViewInit(): void {
    if (!jCoerceBoolean(this.jAutoFocus)) {
      return;
    }

    queueMicrotask(() => this.elementRef.nativeElement.focus());
  }
}
