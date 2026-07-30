import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  booleanAttribute,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';

export type JTruncateMiddleMode = 'characters' | 'width';

@Directive({
  selector: '[jTruncateMiddle]',
  exportAs: 'jTruncateMiddle',
  host: {
    class: 'j-truncate-middle',
    '[attr.dir]': 'direction()',
    '[style.display]': "'block'",
    '[style.min-width]': "'0'",
    '[style.overflow]': "'hidden'",
    '[style.white-space]': "'nowrap'",
  },
})
export class JTruncateMiddleDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;
  private animationFrame?: number;
  private renderedValue = '';
  private sourceValue = '';
  private initialized = false;

  readonly jTruncateMiddle = input<string | null | undefined>(undefined);
  readonly mode = input<JTruncateMiddleMode>('characters');
  readonly maxCharacters = input(32, { transform: numberAttribute });
  readonly leading = input(16, { transform: numberAttribute });
  readonly trailing = input(10, { transform: numberAttribute });
  readonly ellipsis = input('…');
  readonly preserveExtension = input(false, { transform: booleanAttribute });
  readonly showTitle = input(true, { transform: booleanAttribute });
  readonly direction = input<'ltr' | 'rtl' | 'auto'>('auto');

  constructor() {
    effect(() => {
      const explicit = this.jTruncateMiddle();
      if (explicit !== undefined && explicit !== null) this.sourceValue = explicit;
      this.mode();
      this.maxCharacters();
      this.leading();
      this.trailing();
      this.ellipsis();
      this.preserveExtension();
      this.showTitle();
      if (this.initialized) this.schedule();
    });
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    this.sourceValue = this.jTruncateMiddle() ?? this.element.textContent ?? '';
    if (this.isBrowser) {
      const view = this.element.ownerDocument.defaultView;
      const ResizeObserverType = view?.ResizeObserver;
      const MutationObserverType = view?.MutationObserver;
      if (ResizeObserverType) {
        this.resizeObserver = new ResizeObserverType(() => this.schedule());
        this.resizeObserver.observe(this.element);
      }
      if (MutationObserverType) {
        this.mutationObserver = new MutationObserverType(() => {
          const current = this.element.textContent ?? '';
          if (current !== this.renderedValue) {
            this.sourceValue = current;
            this.schedule();
          }
        });
        this.mutationObserver.observe(this.element, {
          characterData: true,
          childList: true,
          subtree: true,
        });
      }
    }
    this.recalculate();
  }

  recalculate(): void {
    if (!this.initialized) return;
    const value = this.jTruncateMiddle() ?? this.sourceValue;
    const rendered =
      this.mode() === 'width'
        ? this.truncateToWidth(value)
        : this.truncateToCharacters(value, Math.max(0, Math.floor(this.maxCharacters())));
    this.renderedValue = rendered;
    if ((this.element.textContent ?? '') !== rendered) this.element.textContent = rendered;
    if (this.showTitle() && rendered !== value) this.element.setAttribute('title', value);
    else this.element.removeAttribute('title');
    this.element.setAttribute('aria-label', value);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    if (this.animationFrame !== undefined) {
      this.element.ownerDocument.defaultView?.cancelAnimationFrame(this.animationFrame);
    }
  }

  private schedule(): void {
    const view = this.element.ownerDocument.defaultView;
    if (!view?.requestAnimationFrame) {
      this.recalculate();
      return;
    }
    if (this.animationFrame !== undefined) view.cancelAnimationFrame(this.animationFrame);
    this.animationFrame = view.requestAnimationFrame(() => {
      this.animationFrame = undefined;
      this.recalculate();
    });
  }

  private truncateToWidth(value: string): string {
    if (!value || this.element.clientWidth <= 0) return value;
    this.renderedValue = value;
    this.element.textContent = value;
    if (this.element.scrollWidth <= this.element.clientWidth) return value;
    let low = 1;
    let high = value.length;
    let best = this.ellipsis();
    while (low <= high) {
      const length = Math.floor((low + high) / 2);
      const candidate = this.truncateToCharacters(value, length);
      this.renderedValue = candidate;
      this.element.textContent = candidate;
      if (this.element.scrollWidth <= this.element.clientWidth) {
        best = candidate;
        low = length + 1;
      } else {
        high = length - 1;
      }
    }
    return best;
  }

  private truncateToCharacters(value: string, maximum: number): string {
    if (!value || value.length <= maximum || maximum <= 0) return maximum <= 0 ? '' : value;
    const ellipsis = this.ellipsis();
    const available = Math.max(0, maximum - ellipsis.length);
    let trailing = Math.min(Math.max(0, Math.floor(this.trailing())), available);
    if (this.preserveExtension()) {
      const extensionIndex = value.lastIndexOf('.');
      const extensionLength =
        extensionIndex > 0 && extensionIndex < value.length - 1 ? value.length - extensionIndex : 0;
      trailing = Math.min(available, Math.max(trailing, extensionLength));
    }
    const leading = Math.min(
      Math.max(0, Math.floor(this.leading())),
      Math.max(0, available - trailing),
    );
    const unused = Math.max(0, available - leading - trailing);
    const resolvedLeading = Math.min(value.length, leading + unused);
    return `${value.slice(0, resolvedLeading)}${ellipsis}${trailing ? value.slice(-trailing) : ''}`;
  }
}
