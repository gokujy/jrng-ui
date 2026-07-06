import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  PLATFORM_ID,
  inject,
  numberAttribute,
} from '@angular/core';
import { JZIndexManagerService } from 'jrng-ui/core';

export type JTooltipPosition = 'top' | 'right' | 'bottom' | 'left';

@Directive({
  selector: '[jTooltip]',
})
export class JTooltipDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zIndexManager = inject(JZIndexManagerService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private tooltipElement: HTMLElement | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  @Input('jTooltip') tooltip = '';
  @Input() tooltipPosition: JTooltipPosition = 'top';
  @Input({ transform: numberAttribute }) showDelay = 0;
  @Input({ transform: numberAttribute }) hideDelay = 0;
  @Input() tooltipDisabled = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearTimers();
      this.removeTooltip();
    });
  }

  @HostListener('mouseenter')
  @HostListener('focusin')
  show(): void {
    if (!this.isBrowser || this.tooltipDisabled || !this.tooltip) {
      return;
    }
    this.clearTimers();
    this.showTimer = setTimeout(() => this.createTooltip(), this.showDelay);
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  hide(): void {
    if (!this.isBrowser) {
      return;
    }

    this.clearTimers();
    this.hideTimer = setTimeout(() => this.removeTooltip(), this.hideDelay);
  }

  private createTooltip(): void {
    if (!this.isBrowser || !this.documentRef.body) {
      return;
    }

    this.removeTooltip();
    const element = this.documentRef.createElement('div');
    element.className = `j-tooltip j-tooltip--${this.tooltipPosition}`;
    element.textContent = this.tooltip;
    element.setAttribute('role', 'tooltip');
    element.setAttribute('data-jc-name', 'tooltip');
    element.setAttribute('data-jc-section', 'root');
    element.setAttribute('data-j-open', 'true');

    // Apply the visual styles before measuring. Without an explicit width the
    // element is a full-width block, so measuring it before styling would report
    // the body width and throw off the centering math.
    Object.assign(element.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: 'max-content',
      maxWidth: '16rem',
      pointerEvents: 'none',
      zIndex: String(this.zIndexManager.next(1300)),
      background: 'var(--j-color-foreground)',
      color: 'var(--j-color-background)',
      padding: 'var(--j-spacing-1) var(--j-spacing-2)',
      borderRadius: 'var(--j-radius-md)',
      fontSize: 'var(--j-font-size-xs)',
      boxShadow: 'var(--j-shadow-md)',
    });

    this.documentRef.body.appendChild(element);
    this.tooltipElement = element;
    this.positionTooltip();
  }

  private positionTooltip(): void {
    if (!this.isBrowser || !this.tooltipElement) {
      return;
    }
    const host = this.elementRef.nativeElement.getBoundingClientRect();
    const tip = this.tooltipElement.getBoundingClientRect();
    const view = this.documentRef.defaultView;
    const gap = 8;
    const margin = 4;
    let top = host.top - tip.height - gap;
    let left = host.left + (host.width - tip.width) / 2;

    if (this.tooltipPosition === 'bottom') {
      top = host.bottom + gap;
    }
    if (this.tooltipPosition === 'left') {
      top = host.top + (host.height - tip.height) / 2;
      left = host.left - tip.width - gap;
    }
    if (this.tooltipPosition === 'right') {
      top = host.top + (host.height - tip.height) / 2;
      left = host.right + gap;
    }

    // Keep the tooltip within the viewport on every edge, not just top/left.
    const maxLeft = Math.max(margin, (view?.innerWidth ?? tip.width) - tip.width - margin);
    const maxTop = Math.max(margin, (view?.innerHeight ?? tip.height) - tip.height - margin);
    left = Math.min(Math.max(margin, left), maxLeft);
    top = Math.min(Math.max(margin, top), maxTop);

    Object.assign(this.tooltipElement.style, {
      top: `${top}px`,
      left: `${left}px`,
    });
  }

  private removeTooltip(): void {
    this.tooltipElement?.remove();
    this.tooltipElement = null;
  }

  private clearTimers(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
