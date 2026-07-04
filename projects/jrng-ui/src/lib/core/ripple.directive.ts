import { Directive, ElementRef, HostBinding, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[jRipple]',
})
export class JRippleDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostBinding('class.j-ripple') readonly rippleClass = true;

  @HostListener('pointerdown', ['$event'])
  handlePointerDown(event: PointerEvent): void {
    const host = this.elementRef.nativeElement;
    const rect = host.getBoundingClientRect();

    host.style.setProperty('--j-ripple-x', `${event.clientX - rect.left}px`);
    host.style.setProperty('--j-ripple-y', `${event.clientY - rect.top}px`);
    host.classList.remove('is-rippling');
    void host.offsetWidth;
    host.classList.add('is-rippling');
  }
}
