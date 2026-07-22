import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

export type JKeyboardShortcutTarget = Document | HTMLElement | Window;

export interface JKeyboardShortcut {
  readonly key: string;
  readonly alt?: boolean;
  readonly ctrl?: boolean;
  readonly meta?: boolean;
  readonly shift?: boolean;
}

export interface JKeyboardShortcutOptions {
  readonly target?: JKeyboardShortcutTarget | null;
  readonly preventDefault?: boolean;
  readonly stopPropagation?: boolean;
  readonly allowInEditable?: boolean;
  readonly disabled?: boolean;
}

export type JKeyboardShortcutCleanup = () => void;
export type JKeyboardShortcutHandler = (event: KeyboardEvent) => void;

@Injectable({ providedIn: 'root' })
export class JKeyboardShortcutsService {
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  register(
    shortcut: string | JKeyboardShortcut,
    handler: JKeyboardShortcutHandler,
    options: JKeyboardShortcutOptions = {},
  ): JKeyboardShortcutCleanup {
    if (!this.isBrowser || options.disabled) {
      return () => undefined;
    }

    const target = options.target ?? this.documentRef;
    const parsedShortcut =
      typeof shortcut === 'string' ? jParseKeyboardShortcut(shortcut) : normalizeShortcut(shortcut);

    const listener = (event: Event): void => {
      const KeyboardEventCtor = this.documentRef.defaultView?.KeyboardEvent;
      if (!(KeyboardEventCtor && event instanceof KeyboardEventCtor)) {
        return;
      }
      if (!options.allowInEditable && jIsEditableShortcutTarget(event.target)) {
        return;
      }
      if (!jMatchesKeyboardShortcut(event, parsedShortcut)) {
        return;
      }

      if (options.preventDefault) {
        event.preventDefault();
      }
      if (options.stopPropagation) {
        event.stopPropagation();
      }
      handler(event);
    };

    target.addEventListener('keydown', listener);
    return () => target.removeEventListener('keydown', listener);
  }
}

export function jParseKeyboardShortcut(shortcut: string): JKeyboardShortcut {
  const parts = shortcut
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean);

  const parsed: {
    key: string;
    alt: boolean;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
  } = {
    key: '',
    alt: false,
    ctrl: false,
    meta: false,
    shift: false,
  };

  for (const part of parts) {
    const token = part.toLowerCase();
    if (token === 'alt' || token === 'option') {
      parsed.alt = true;
    } else if (token === 'ctrl' || token === 'control') {
      parsed.ctrl = true;
    } else if (token === 'cmd' || token === 'command' || token === 'meta') {
      parsed.meta = true;
    } else if (token === 'shift') {
      parsed.shift = true;
    } else {
      parsed.key = normalizeKey(part);
    }
  }

  return parsed;
}

export function jMatchesKeyboardShortcut(
  event: KeyboardEvent,
  shortcut: JKeyboardShortcut,
): boolean {
  const normalized = normalizeShortcut(shortcut);
  return (
    normalizeKey(event.key) === normalized.key &&
    event.altKey === Boolean(normalized.alt) &&
    event.ctrlKey === Boolean(normalized.ctrl) &&
    event.metaKey === Boolean(normalized.meta) &&
    event.shiftKey === Boolean(normalized.shift)
  );
}

export function jIsEditableShortcutTarget(target: EventTarget | null): boolean {
  const candidate = target as (HTMLElement & { ownerDocument?: Document }) | null;
  const HTMLElementCtor = candidate?.ownerDocument?.defaultView?.HTMLElement;
  if (!candidate || !HTMLElementCtor || !(candidate instanceof HTMLElementCtor)) {
    return false;
  }

  const tagName = candidate.tagName.toLowerCase();
  return (
    candidate.isContentEditable ||
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select'
  );
}

function normalizeShortcut(shortcut: JKeyboardShortcut): JKeyboardShortcut {
  return {
    key: normalizeKey(shortcut.key),
    alt: Boolean(shortcut.alt),
    ctrl: Boolean(shortcut.ctrl),
    meta: Boolean(shortcut.meta),
    shift: Boolean(shortcut.shift),
  };
}

function normalizeKey(key: string): string {
  if (key === ' ') {
    return 'space';
  }
  return key.length === 1 ? key.toLowerCase() : key.toLowerCase().replace(/\s+/g, '');
}
