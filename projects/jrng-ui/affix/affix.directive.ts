import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  OnInit,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';

export type JAffixPosition = 'top' | 'bottom';

@Directive({
  selector: '[jAffix]',
  exportAs: 'jAffix',
  host: {
    class: 'j-affix',
    '[class.j-affix--active]': 'affixed()',
    '[attr.data-j-affixed]': 'affixed()',
  },
})
export class JAffixDirective implements OnInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cleanup: (() => void)[] = [];
  private placeholder?: HTMLElement;
  private resizeObserver?: ResizeObserver;
  private frame = 0;
  private originalStyle = '';

  readonly position = input<JAffixPosition>('top', { alias: 'jAffix' });
  readonly offset = input(0, { transform: numberAttribute });
  readonly scrollContainer = input<HTMLElement | null>(null);
  readonly boundary = input<HTMLElement | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly zIndex = input(100, { transform: numberAttribute });
  readonly affixed = signal(false);

  readonly affixedChange = output<boolean>();

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.originalStyle = this.element.getAttribute('style') ?? '';
    this.placeholder = this.documentRef.createElement('div');
    this.placeholder.className = 'j-affix__placeholder';
    this.placeholder.hidden = true;
    this.element.parentNode?.insertBefore(this.placeholder, this.element);
    const target: EventTarget = this.scrollContainer() ?? this.documentRef.defaultView!;
    const listener = () => this.schedule();
    target.addEventListener('scroll', listener, { passive: true });
    this.cleanup.push(() => target.removeEventListener('scroll', listener));
    const Resize = this.documentRef.defaultView?.ResizeObserver;
    if (Resize) {
      this.resizeObserver = new Resize(() => this.schedule());
      this.resizeObserver.observe(this.element);
      if (this.boundary()) this.resizeObserver.observe(this.boundary()!);
      if (this.scrollContainer()) this.resizeObserver.observe(this.scrollContainer()!);
    }
    this.recalculate();
  }

  recalculate(): void {
    if (!this.isBrowser || !this.placeholder) return;
    if (this.disabled()) {
      this.setAffixed(false);
      return;
    }
    const anchor = this.affixed() ? this.placeholder : this.element;
    const rect = anchor.getBoundingClientRect();
    const containerRect = this.scrollContainer()?.getBoundingClientRect();
    const viewportTop = containerRect?.top ?? 0;
    const viewportBottom =
      containerRect?.bottom ?? this.documentRef.defaultView?.innerHeight ?? Number.MAX_SAFE_INTEGER;
    const shouldAffix =
      this.position() === 'top'
        ? rect.top <= viewportTop + this.offset()
        : rect.bottom >= viewportBottom - this.offset();
    this.setAffixed(shouldAffix);
    if (!shouldAffix) return;
    const width = this.placeholder.getBoundingClientRect().width || rect.width;
    const left = this.placeholder.getBoundingClientRect().left || rect.left;
    Object.assign(this.element.style, {
      position: 'fixed',
      insetBlockStart: this.position() === 'top' ? `${viewportTop + this.offset()}px` : 'auto',
      insetBlockEnd:
        this.position() === 'bottom'
          ? `${Math.max(0, (this.documentRef.defaultView?.innerHeight ?? viewportBottom) - viewportBottom + this.offset())}px`
          : 'auto',
      insetInlineStart: `${left}px`,
      width: `${width}px`,
      zIndex: String(this.zIndex()),
    });
    const boundaryRect = this.boundary()?.getBoundingClientRect();
    if (boundaryRect) {
      const elementRect = this.element.getBoundingClientRect();
      const shift =
        this.position() === 'top'
          ? Math.min(0, boundaryRect.bottom - this.offset() - elementRect.bottom)
          : Math.max(0, boundaryRect.top + this.offset() - elementRect.top);
      this.element.style.transform = shift ? `translateY(${shift}px)` : '';
    }
  }

  ngOnDestroy(): void {
    if (this.frame) this.documentRef.defaultView?.cancelAnimationFrame(this.frame);
    this.resizeObserver?.disconnect();
    this.cleanup.splice(0).forEach((remove) => remove());
    this.restoreStyle();
    this.placeholder?.remove();
  }

  private schedule(): void {
    if (this.frame) return;
    const windowRef = this.documentRef.defaultView;
    if (!windowRef) return;
    this.frame = windowRef.requestAnimationFrame(() => {
      this.frame = 0;
      this.recalculate();
    });
  }

  private setAffixed(next: boolean): void {
    if (this.affixed() === next) {
      if (!next) this.restoreStyle();
      return;
    }
    this.affixed.set(next);
    if (this.placeholder) {
      if (next) {
        const rect = this.element.getBoundingClientRect();
        this.placeholder.style.width = `${rect.width}px`;
        this.placeholder.style.height = `${rect.height}px`;
        this.placeholder.hidden = false;
      } else {
        this.placeholder.hidden = true;
        this.restoreStyle();
      }
    }
    this.affixedChange.emit(next);
  }

  private restoreStyle(): void {
    if (this.originalStyle) this.element.setAttribute('style', this.originalStyle);
    else this.element.removeAttribute('style');
  }
}
