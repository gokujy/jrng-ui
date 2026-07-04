import { J_KEY } from './keyboard';

export function jIsEscapeKey(event: KeyboardEvent): boolean {
  return event.key === J_KEY.escape;
}

export function jHandleEscapeKey(event: KeyboardEvent, handler: () => void): void {
  if (!jIsEscapeKey(event)) {
    return;
  }

  event.preventDefault();
  handler();
}
