import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Output,
} from '@angular/core';

@Directive({
  selector: '[jClickOutside]',
})
export class JClickOutsideDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @Output() jClickOutside = new EventEmitter<MouseEvent | TouchEvent>();

  @HostListener('document:mousedown', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  handleDocumentPointer(event: MouseEvent | TouchEvent): void {
    const target = event.target;

    if (!(target instanceof Node) || this.elementRef.nativeElement.contains(target)) {
      return;
    }

    this.jClickOutside.emit(event);
  }
}
