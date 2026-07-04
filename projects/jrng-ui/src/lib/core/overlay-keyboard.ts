import { J_KEY } from './keyboard';

export function jIsEscapeKey(event: KeyboardEvent): boolean {
  return event.key === J_KEY.Escape || event.key === J_KEY.escape;
}

export function jHandleEscapeKey(event: KeyboardEvent, handler: () => void): void {
  if (!jIsEscapeKey(event)) {
    return;
  }

  event.preventDefault();
  handler();
}

export function jListenEscapeKey(
  documentRef: Document | null | undefined,
  handler: (event: KeyboardEvent) => void,
): () => void {
  if (!documentRef) {
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
