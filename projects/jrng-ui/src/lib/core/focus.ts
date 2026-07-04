import { J_KEY } from './keyboard';

const focusableSelector = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface JRovingTabIndexOptions {
  readonly orientation?: 'horizontal' | 'vertical' | 'both';
  readonly loop?: boolean;
}

export interface JTypeaheadItem<T> {
  readonly item: T;
  readonly text: string;
  readonly disabled?: boolean;
}

export interface JTypeaheadController<T> {
  search(key: string, items: readonly JTypeaheadItem<T>[], startIndex?: number): number;
  clear(): void;
}

export function jFocusableElements(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.tabIndex !== -1 &&
      element.getAttribute('aria-hidden') !== 'true',
  );
}

export function jFocusFirst(root: ParentNode): boolean {
  const first = jFocusableElements(root)[0];

  if (!first) {
    return false;
  }

  first.focus();
  return true;
}

export function jFocusInitial(
  root: ParentNode,
  selector = '[autofocus], [data-j-initial-focus], [jAutoFocus]',
): boolean {
  const initial = root.querySelector<HTMLElement>(selector);

  if (initial && !initial.hasAttribute('disabled') && initial.tabIndex !== -1) {
    initial.focus();
    return true;
  }

  return jFocusFirst(root);
}

export function jRememberFocus(documentRef?: Document | null): () => void {
  if (!documentRef) {
    return () => undefined;
  }

  const HTMLElementCtor = documentRef.defaultView?.HTMLElement;
  const activeElement =
    HTMLElementCtor && documentRef.activeElement instanceof HTMLElementCtor ? documentRef.activeElement : null;

  return () => {
    activeElement?.focus();
  };
}

export function jRestoreFocus(documentRef?: Document | null): () => void {
  return jRememberFocus(documentRef);
}

export function jTrapFocus(event: KeyboardEvent, root: HTMLElement, documentRef?: Document | null): void {
  if (event.key !== J_KEY.Tab && event.key !== J_KEY.tab) {
    return;
  }

  const focusable = jFocusableElements(root);

  if (!focusable.length) {
    event.preventDefault();
    root.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const activeElement = documentRef?.activeElement ?? null;

  if (event.shiftKey && activeElement === first) {
    event.preventDefault();
    last?.focus();
    return;
  }

  if (!event.shiftKey && activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}

export function jApplyRovingTabIndex(items: readonly HTMLElement[], activeIndex: number): void {
  items.forEach((item, index) => {
    item.tabIndex = index === activeIndex ? 0 : -1;
  });
}

export function jMoveRovingTabIndex(
  currentIndex: number,
  itemCount: number,
  key: string,
  options: JRovingTabIndexOptions = {},
): number {
  if (itemCount <= 0) {
    return -1;
  }

  const loop = options.loop ?? true;
  const orientation = options.orientation ?? 'both';
  const lastIndex = itemCount - 1;

  if (key === J_KEY.Home || key === J_KEY.home) {
    return 0;
  }

  if (key === J_KEY.End || key === J_KEY.end) {
    return lastIndex;
  }

  const canMoveVertical = orientation === 'vertical' || orientation === 'both';
  const canMoveHorizontal = orientation === 'horizontal' || orientation === 'both';
  const direction =
    canMoveVertical && (key === J_KEY.ArrowDown || key === J_KEY.arrowDown)
      ? 1
      : canMoveVertical && (key === J_KEY.ArrowUp || key === J_KEY.arrowUp)
        ? -1
        : canMoveHorizontal && (key === J_KEY.ArrowRight || key === J_KEY.arrowRight)
          ? 1
          : canMoveHorizontal && (key === J_KEY.ArrowLeft || key === J_KEY.arrowLeft)
            ? -1
            : 0;

  if (direction === 0) {
    return currentIndex;
  }

  const next = currentIndex + direction;

  if (loop) {
    return (next + itemCount) % itemCount;
  }

  return Math.min(Math.max(next, 0), lastIndex);
}

export function jCreateTypeahead<T>(timeoutMs = 700): JTypeaheadController<T> {
  let query = '';
  let lastTypedAt = 0;

  return {
    search(key: string, items: readonly JTypeaheadItem<T>[], startIndex = -1): number {
      if (key.length !== 1 || !key.trim()) {
        return -1;
      }

      const now = Date.now();
      query = now - lastTypedAt > timeoutMs ? key.toLowerCase() : `${query}${key.toLowerCase()}`;
      lastTypedAt = now;

      const count = items.length;

      for (let offset = 1; offset <= count; offset += 1) {
        const index = (startIndex + offset + count) % count;
        const candidate = items[index];

        if (!candidate || candidate.disabled) {
          continue;
        }

        if (candidate.text.trim().toLowerCase().startsWith(query)) {
          return index;
        }
      }

      return -1;
    },
    clear(): void {
      query = '';
      lastTypedAt = 0;
    },
  };
}
