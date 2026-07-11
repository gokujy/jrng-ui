import { WritableSignal, signal } from '@angular/core';

export interface JDisclosureState {
  readonly open: WritableSignal<boolean>;
  show(): void;
  hide(): void;
  toggle(force?: boolean): void;
}

export function jCreateDisclosure(initialOpen = false): JDisclosureState {
  const open = signal(initialOpen);
  return {
    open,
    show: () => open.set(true),
    hide: () => open.set(false),
    toggle: (force) => open.update((current) => force ?? !current),
  };
}
