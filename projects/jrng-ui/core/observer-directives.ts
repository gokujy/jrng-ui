import {
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
  output,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[jResizeObserver]',
  exportAs: 'jResizeObserver',
})
export class JResizeObserverDirective implements OnInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private observer: ResizeObserver | null = null;

  readonly jResize = output<ResizeObserverEntry>();

  ngOnInit(): void {
    const ResizeObserverCtor = this.isBrowser ? globalThis.ResizeObserver : undefined;
    if (!ResizeObserverCtor) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.observer = new ResizeObserverCtor((entries) => {
        const entry = entries[0];
        if (entry) {
          this.zone.run(() => this.jResize.emit(entry));
        }
      });
      this.observer.observe(this.elementRef.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}

@Directive({
  selector: '[jIntersectionObserver]',
  exportAs: 'jIntersectionObserver',
})
export class JIntersectionObserverDirective implements OnInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private observer: IntersectionObserver | null = null;

  readonly jIntersect = output<IntersectionObserverEntry>();

  ngOnInit(): void {
    const IntersectionObserverCtor = this.isBrowser ? globalThis.IntersectionObserver : undefined;
    if (!IntersectionObserverCtor) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserverCtor((entries) => {
        const entry = entries[0];
        if (entry) {
          this.zone.run(() => this.jIntersect.emit(entry));
        }
      });
      this.observer.observe(this.elementRef.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
