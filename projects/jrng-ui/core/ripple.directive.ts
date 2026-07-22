import {
  booleanAttribute,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  input,
  inject,
  computed,
} from '@angular/core';
import { jPrefersReducedMotion } from './accessibility-preferences';
import { JRNG_CONFIG } from './config';

@Directive({
  selector: '[jRipple]',
})
export class JRippleDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly config = inject(JRNG_CONFIG);

  @HostBinding('class.j-ripple') readonly rippleClass = true;

  readonly enabled = input<boolean | undefined, unknown>(undefined, {
    alias: 'jRipple',
    transform: (value) => (value == null ? undefined : booleanAttribute(value)),
  });
  readonly rippleDisabled = input(false, { transform: booleanAttribute });
  readonly isEnabled = computed(() => this.enabled() ?? this.config.ripple);

  @HostListener('pointerdown', ['$event'])
  handlePointerDown(event: PointerEvent): void {
    if (!this.isEnabled() || this.rippleDisabled() || this.prefersReducedMotion()) {
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
    return jPrefersReducedMotion(this.elementRef.nativeElement.ownerDocument);
  }
}
