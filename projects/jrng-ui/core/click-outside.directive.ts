import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  Renderer2,
  inject,
  output,
} from '@angular/core';

@Directive({
  selector: '[jClickOutside]',
})
export class JClickOutsideDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly documentRef = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly jClickOutside = output<MouseEvent | TouchEvent>();

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    const removeMouseListener = this.renderer.listen(
      this.documentRef,
      'mousedown',
      (event: MouseEvent) => {
        this.handleDocumentPointer(event);
      },
    );
    const removeTouchListener = this.renderer.listen(
      this.documentRef,
      'touchstart',
      (event: TouchEvent) => {
        this.handleDocumentPointer(event);
      },
    );

    this.destroyRef.onDestroy(() => {
      removeMouseListener();
      removeTouchListener();
    });
  }

  handleDocumentPointer(event: MouseEvent | TouchEvent): void {
    const target = event.target;

    if (!this.isNode(target) || this.elementRef.nativeElement.contains(target)) {
      return;
    }

    this.jClickOutside.emit(event);
  }

  private isNode(value: EventTarget | null): value is Node {
    const NodeCtor = this.documentRef.defaultView?.Node;
    return !!NodeCtor && value instanceof NodeCtor;
  }
}
