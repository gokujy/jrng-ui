import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, inject, input, PLATFORM_ID } from '@angular/core';
import { jCoerceBoolean } from './coercion';

@Directive({
  selector: '[jAutoFocus]',
})
export class JAutoFocusDirective implements AfterViewInit {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly jAutoFocus = input<boolean | string>(true, { alias: 'jAutoFocus' });

  ngAfterViewInit(): void {
    if (!this.isBrowser || !jCoerceBoolean(this.jAutoFocus())) {
      return;
    }

    queueMicrotask(() => this.elementRef.nativeElement.focus());
  }
}
