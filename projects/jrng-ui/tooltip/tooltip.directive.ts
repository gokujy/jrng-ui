import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  HostListener,
  booleanAttribute,
  input,
  PLATFORM_ID,
  inject,
  numberAttribute,
} from '@angular/core';
import { JZIndexManagerService, jCreateId } from 'jrng-ui/core';

export type JTooltipPosition = 'auto' | 'top' | 'right' | 'bottom' | 'left';

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

  readonly tooltip = input('', { alias: 'jTooltip' });
  readonly tooltipPosition = input<JTooltipPosition>('top');
  readonly showDelay = input(0, { transform: numberAttribute });
  readonly hideDelay = input(0, { transform: numberAttribute });
  readonly tooltipDisabled = input(false, { transform: booleanAttribute });
  readonly tooltipInteractive = input(false, { transform: booleanAttribute });
  readonly tooltipWidth = input('');
  readonly tooltipMaxWidth = input('16rem');

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearTimers();
      this.removeTooltip();
    });
  }

  @HostListener('mouseenter')
  @HostListener('focusin')
  show(): void {
    if (!this.isBrowser || this.tooltipDisabled() || !this.tooltip()) {
      return;
    }
    this.clearTimers();
    this.showTimer = setTimeout(() => this.createTooltip(), this.showDelay());
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  hide(): void {
    if (!this.isBrowser) {
      return;
    }

    this.clearTimers();
    this.hideTimer = setTimeout(() => this.removeTooltip(), this.hideDelay());
  }

  @HostListener('document:keydown.escape', ['$event'])
  closeOnEscape(event: Event): void {
    if (!this.tooltipElement) return;
    event.preventDefault();
    this.clearTimers();
    this.removeTooltip();
  }

  private createTooltip(): void {
    if (!this.isBrowser || !this.documentRef.body) {
      return;
    }

    this.removeTooltip();
    const element = this.documentRef.createElement('div');
    const id = jCreateId('j-tooltip');
    element.className = 'j-tooltip';
    element.id = id;
    const content = this.documentRef.createElement('span');
    content.className = 'j-tooltip__content';
    content.textContent = this.tooltip();
    const arrow = this.documentRef.createElement('span');
    arrow.className = 'j-tooltip__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    element.append(content, arrow);
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
      width: this.tooltipWidth() || 'max-content',
      maxWidth: this.tooltipMaxWidth(),
      whiteSpace: 'pre-line',
      pointerEvents: this.tooltipInteractive() ? 'auto' : 'none',
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
    this.elementRef.nativeElement.setAttribute('aria-describedby', id);
    if (this.tooltipInteractive()) {
      element.addEventListener('mouseenter', () => this.clearTimers());
      element.addEventListener('mouseleave', () => this.hide());
    }
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
    const requested = this.tooltipPosition();
    const spaces = {
      top: host.top,
      bottom: (view?.innerHeight ?? 0) - host.bottom,
      left: host.left,
      right: (view?.innerWidth ?? 0) - host.right,
    };
    let placement: Exclude<JTooltipPosition, 'auto'> =
      requested === 'auto'
        ? (Object.entries(spaces).sort((a, b) => b[1] - a[1])[0]?.[0] as Exclude<
            JTooltipPosition,
            'auto'
          >)
        : requested;
    const required =
      placement === 'top' || placement === 'bottom' ? tip.height + gap : tip.width + gap;
    if (spaces[placement] < required) {
      const opposite =
        placement === 'top'
          ? 'bottom'
          : placement === 'bottom'
            ? 'top'
            : placement === 'left'
              ? 'right'
              : 'left';
      if (spaces[opposite] > spaces[placement]) placement = opposite;
    }
    this.tooltipElement.className = `j-tooltip j-tooltip--${placement}`;
    this.tooltipElement.setAttribute('data-j-placement', placement);
    let top = host.top - tip.height - gap;
    let left = host.left + (host.width - tip.width) / 2;

    if (placement === 'bottom') {
      top = host.bottom + gap;
    }
    if (placement === 'left') {
      top = host.top + (host.height - tip.height) / 2;
      left = host.left - tip.width - gap;
    }
    if (placement === 'right') {
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
    this.positionArrow(placement, host, { top, left, width: tip.width, height: tip.height });
  }

  private positionArrow(
    placement: Exclude<JTooltipPosition, 'auto'>,
    host: DOMRect,
    tip: { top: number; left: number; width: number; height: number },
  ): void {
    const arrow = this.tooltipElement?.querySelector<HTMLElement>('.j-tooltip__arrow');
    if (!arrow) return;
    const size = 8;
    Object.assign(arrow.style, {
      background: 'var(--j-color-foreground)',
      border: 'solid var(--j-tooltip-border-color, transparent)',
      height: `${size}px`,
      position: 'absolute',
      transform: 'rotate(45deg)',
      width: `${size}px`,
    });
    if (placement === 'top' || placement === 'bottom') {
      const x = Math.min(
        tip.width - size * 1.5,
        Math.max(size / 2, host.left + host.width / 2 - tip.left - size / 2),
      );
      Object.assign(arrow.style, {
        left: `${x}px`,
        top: placement === 'top' ? `${tip.height - size / 2}px` : `${-size / 2}px`,
        borderWidth: placement === 'top' ? '0 1px 1px 0' : '1px 0 0 1px',
      });
    } else {
      const y = Math.min(
        tip.height - size * 1.5,
        Math.max(size / 2, host.top + host.height / 2 - tip.top - size / 2),
      );
      Object.assign(arrow.style, {
        top: `${y}px`,
        left: placement === 'left' ? `${tip.width - size / 2}px` : `${-size / 2}px`,
        borderWidth: placement === 'left' ? '1px 1px 0 0' : '0 0 1px 1px',
      });
    }
  }

  private removeTooltip(): void {
    const id = this.tooltipElement?.id;
    this.tooltipElement?.remove();
    this.tooltipElement = null;
    if (id && this.elementRef.nativeElement.getAttribute('aria-describedby') === id) {
      this.elementRef.nativeElement.removeAttribute('aria-describedby');
    }
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
