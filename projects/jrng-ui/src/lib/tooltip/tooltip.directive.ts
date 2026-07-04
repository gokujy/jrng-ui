import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, Directive, ElementRef, HostListener, Input, PLATFORM_ID, inject, numberAttribute } from '@angular/core';

export type JTooltipPosition = 'top' | 'right' | 'bottom' | 'left';

@Directive({
  selector: '[jTooltip]',
})
export class JTooltipDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
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
    const gap = 8;
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

    Object.assign(this.tooltipElement.style, {
      position: 'fixed',
      top: `${Math.max(4, top)}px`,
      left: `${Math.max(4, left)}px`,
      zIndex: '1300',
      pointerEvents: 'none',
      background: 'var(--j-color-text)',
      color: 'var(--j-color-surface)',
      padding: 'var(--j-spacing-xs) var(--j-spacing-sm)',
      borderRadius: 'var(--j-radius-sm)',
      fontSize: 'var(--j-font-size-xs)',
      boxShadow: 'var(--j-shadow-md)',
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
