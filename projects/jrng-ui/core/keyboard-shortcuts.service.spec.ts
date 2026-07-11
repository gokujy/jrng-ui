import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import {
  JKeyboardShortcutsService,
  jMatchesKeyboardShortcut,
  jParseKeyboardShortcut,
} from './keyboard-shortcuts.service';

describe('keyboard shortcuts', () => {
  it('parses and matches modifier combinations', () => {
    const shortcut = jParseKeyboardShortcut('ctrl+shift+k');
    const event = new KeyboardEvent('keydown', {
      key: 'K',
      ctrlKey: true,
      shiftKey: true,
    });

    expect(shortcut).toEqual({
      key: 'k',
      alt: false,
      ctrl: true,
      meta: false,
      shift: true,
    });
    expect(jMatchesKeyboardShortcut(event, shortcut)).toBe(true);
  });

  it('registers shortcuts and removes listeners through cleanup', () => {
    const service = TestBed.inject(JKeyboardShortcutsService);
    const handler = vi.fn();
    const cleanup = service.register('ctrl+k', handler, { preventDefault: true });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    cleanup();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('ignores editable targets unless explicitly allowed', () => {
    const service = TestBed.inject(JKeyboardShortcutsService);
    const handler = vi.fn();
    const input = document.createElement('input');
    document.body.appendChild(input);
    const cleanup = service.register('ctrl+k', handler);

    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    );

    cleanup();
    input.remove();
    expect(handler).not.toHaveBeenCalled();
  });
});
