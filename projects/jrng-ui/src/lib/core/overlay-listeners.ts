import { jIsNode } from './dom';
import { jIsEscapeKey } from './overlay-keyboard';

export function jListenOutsideClick(
  documentRef: Document | null | undefined,
  root: HTMLElement,
  handler: (event: MouseEvent | TouchEvent) => void,
): () => void {
  if (!documentRef?.defaultView) {
    return () => undefined;
  }

  const listener = (event: Event): void => {
    const MouseEventCtor = documentRef.defaultView?.MouseEvent;
    const TouchEventCtor = documentRef.defaultView?.TouchEvent;

    if (
      !(MouseEventCtor && event instanceof MouseEventCtor) &&
      !(TouchEventCtor && event instanceof TouchEventCtor)
    ) {
      return;
    }

    const target = event.target;

    if (!jIsNode(target, documentRef) || root.contains(target)) {
      return;
    }

    handler(event);
  };

  documentRef.addEventListener('mousedown', listener);
  documentRef.addEventListener('touchstart', listener);

  return () => {
    documentRef.removeEventListener('mousedown', listener);
    documentRef.removeEventListener('touchstart', listener);
  };
}

export function jListenOverlayEscape(
  documentRef: Document | null | undefined,
  handler: (event: KeyboardEvent) => void,
): () => void {
  if (!documentRef?.defaultView) {
    return () => undefined;
  }

  const listener = (event: Event): void => {
    const KeyboardEventCtor = documentRef.defaultView?.KeyboardEvent;

    if (KeyboardEventCtor && event instanceof KeyboardEventCtor && jIsEscapeKey(event)) {
      handler(event);
    }
  };

  documentRef.addEventListener('keydown', listener);
  return () => documentRef.removeEventListener('keydown', listener);
}
