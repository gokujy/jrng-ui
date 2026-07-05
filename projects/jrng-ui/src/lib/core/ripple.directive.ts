import { booleanAttribute, Directive, ElementRef, HostBinding, HostListener, Input, inject } from '@angular/core';

@Directive({
  selector: '[jRipple]',
})
export class JRippleDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostBinding('class.j-ripple') readonly rippleClass = true;

  @Input({ alias: 'jRipple', transform: booleanAttribute }) enabled = true;
  @Input({ transform: booleanAttribute }) rippleDisabled = false;

  @HostListener('pointerdown', ['$event'])
  handlePointerDown(event: PointerEvent): void {
    if (!this.enabled || this.rippleDisabled || this.prefersReducedMotion()) {
      return;
    }

    const host = this.elementRef.nativeElement;
    if (this.isHostDisabled(host)) {
      return;
    }

    const rect = host.getBoundingClientRect();

    host.style.setProperty('--j-ripple-x', `${event.clientX - rect.left}px`);
    host.style.setProperty('--j-ripple-y', `${event.clientY - rect.top}px`);
    host.classList.remove('is-rippling');
    void host.offsetWidth;
    host.classList.add('is-rippling');
  }

  private isHostDisabled(host: HTMLElement): boolean {
    return (
      host.hasAttribute('disabled') ||
      host.getAttribute('aria-disabled') === 'true' ||
      host.getAttribute('data-j-disabled') === 'true' ||
      host.getAttribute('data-j-loading') === 'true' ||
      host.classList.contains('is-disabled') ||
      host.classList.contains('is-loading')
    );
  }

  private prefersReducedMotion(): boolean {
    return this.elementRef.nativeElement.ownerDocument.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;
  }
}
