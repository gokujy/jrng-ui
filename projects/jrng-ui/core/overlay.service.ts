import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { jComputeConnectedPosition } from './overlay-position';
import { JZIndexManagerService } from './z-index-manager.service';
import { JRNG_CONFIG, JAppendTo } from './config';

export interface JOverlayAttachOptions {
  /** Where to render the panel. `'body'` (or an element) portals it to escape clipping. */
  appendTo?: JAppendTo;
  /** Gap between trigger and panel. Default 4. */
  gap?: number;
  /** Constrain panel width to trigger width. Default true. */
  matchWidth?: boolean;
  /** Preferred placement; `'auto'` flips based on space. Default `'auto'`. */
  placement?: 'bottom' | 'top' | 'auto';
  /** Base z-index bucket. Default 1000 (dropdown layer). */
  baseZIndex?: number;
}

export interface JOverlayHandle {
  /** Recompute and apply the panel position. */
  reposition(): void;
  /** Stop tracking and remove listeners (does not remove the panel node). */
  detach(): void;
}

const NOOP_HANDLE: JOverlayHandle = { reposition: () => undefined, detach: () => undefined };

/**
 * Positions a connected overlay panel relative to a trigger and keeps it aligned
 * on scroll/resize. Optionally portals the panel to `document.body` (or a target
 * element) so it escapes `overflow:hidden`/stacking-context clipping — the shared
 * mechanism behind `appendTo` for dropdown-style components.
 */
@Injectable({ providedIn: 'root' })
export class JOverlayService {
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zIndex = inject(JZIndexManagerService);
  private readonly config = inject(JRNG_CONFIG);

  attach(
    trigger: HTMLElement,
    panel: HTMLElement,
    options: JOverlayAttachOptions = {},
  ): JOverlayHandle {
    if (!this.isBrowser) {
      return NOOP_HANDLE;
    }

    const portal = this.portal(panel, options.appendTo);

    panel.style.position = 'fixed';
    panel.style.zIndex = String(this.zIndex.next(options.baseZIndex ?? 1000));

    const view = this.documentRef.defaultView;
    const reposition = (): void => {
      const t = trigger.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      const position = jComputeConnectedPosition({
        trigger: { top: t.top, bottom: t.bottom, left: t.left, width: t.width },
        panel: { width: p.width, height: p.height },
        viewport: { width: view?.innerWidth ?? 0, height: view?.innerHeight ?? 0 },
        gap: options.gap,
        placement: options.placement,
        matchWidth: options.matchWidth ?? true,
      });
      panel.style.top = `${position.top}px`;
      panel.style.left = `${position.left}px`;
      if (position.width != null) {
        panel.style.width = `${position.width}px`;
      }
      panel.dataset['jPlacement'] = position.placement;
    };

    reposition();
    // `true` (capture) so nested scroll containers also trigger a reposition.
    view?.addEventListener('scroll', reposition, true);
    view?.addEventListener('resize', reposition);

    return {
      reposition,
      detach: () => {
        view?.removeEventListener('scroll', reposition, true);
        view?.removeEventListener('resize', reposition);
        portal.detach();
      },
    };
  }

  /** Moves an Angular-owned overlay root without applying connected positioning. */
  portal(panel: HTMLElement, appendTo?: JAppendTo): JOverlayHandle {
    if (!this.isBrowser) return NOOP_HANDLE;
    const originalParent = panel.parentNode;
    const originalNextSibling = panel.nextSibling;
    const container = this.resolveTarget(appendTo);
    if (!container || container === originalParent) return NOOP_HANDLE;
    container.appendChild(panel);
    return {
      reposition: () => undefined,
      detach: () => {
        if (panel.parentNode !== container) return;
        if (originalParent?.isConnected) {
          originalParent.insertBefore(
            panel,
            originalNextSibling?.parentNode === originalParent ? originalNextSibling : null,
          );
        } else {
          panel.remove();
        }
      },
    };
  }

  /** Resolves all public append-target forms without touching browser globals. */
  resolveTarget(target?: JAppendTo): HTMLElement | null {
    target ??= this.config.appendTo;
    if (!this.isBrowser || target === 'self') return null;
    if (target === 'body') return this.documentRef.body ?? null;
    if (typeof target === 'string') {
      try {
        return this.documentRef.querySelector<HTMLElement>(target);
      } catch {
        return null;
      }
    }
    const HTMLElementCtor = this.documentRef.defaultView?.HTMLElement;
    return HTMLElementCtor && target instanceof HTMLElementCtor ? target : null;
  }
}
