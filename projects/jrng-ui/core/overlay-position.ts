/** Vertical placement of a connected overlay relative to its trigger. */
export type JOverlayPlacement = 'bottom' | 'top';

export interface JOverlayPositionInput {
  /** Trigger rectangle in viewport coordinates. */
  trigger: { top: number; bottom: number; left: number; width: number };
  /** Measured panel size. */
  panel: { width: number; height: number };
  /** Viewport size. */
  viewport: { width: number; height: number };
  /** Gap between trigger and panel. Default 4. */
  gap?: number;
  /** Preferred placement; `'auto'` flips based on available space. Default `'auto'`. */
  placement?: 'bottom' | 'top' | 'auto';
  /** Constrain the panel width to the trigger width. Default true. */
  matchWidth?: boolean;
  /** Minimum distance to keep from the viewport edges. Default 4. */
  margin?: number;
}

export interface JConnectedOverlayPosition {
  top: number;
  left: number;
  /** Set when `matchWidth` is enabled. */
  width?: number;
  placement: JOverlayPlacement;
}

/**
 * Compute a connected-overlay position (fixed/viewport coordinates): placed below
 * the trigger by default, flipped above when there is not enough room below, and
 * clamped to stay within the viewport. Pure and side-effect free for easy testing.
 */
export function jComputeConnectedPosition(input: JOverlayPositionInput): JConnectedOverlayPosition {
  const gap = input.gap ?? 4;
  const margin = input.margin ?? 4;
  const matchWidth = input.matchWidth ?? true;
  const { trigger, panel, viewport } = input;

  const spaceBelow = viewport.height - trigger.bottom;
  const spaceAbove = trigger.top;

  let placement: JOverlayPlacement;
  if (input.placement === 'top' || input.placement === 'bottom') {
    placement = input.placement;
  } else {
    // Prefer below; flip up only when below cannot fit and above has more room.
    placement = spaceBelow >= panel.height + gap || spaceBelow >= spaceAbove ? 'bottom' : 'top';
  }

  const width = matchWidth ? trigger.width : panel.width;
  let left = trigger.left;
  const maxLeft = Math.max(margin, viewport.width - width - margin);
  left = Math.min(Math.max(margin, left), maxLeft);

  let top = placement === 'bottom' ? trigger.bottom + gap : trigger.top - panel.height - gap;
  const maxTop = Math.max(margin, viewport.height - panel.height - margin);
  top = Math.min(Math.max(margin, top), maxTop);

  const position: JConnectedOverlayPosition = { top, left, placement };
  if (matchWidth) {
    position.width = trigger.width;
  }
  return position;
}
