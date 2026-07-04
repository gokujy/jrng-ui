const focusableSelector = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function jFocusableElements(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1,
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

export function jRememberFocus(documentRef: Document = document): () => void {
  const activeElement = documentRef.activeElement instanceof HTMLElement ? documentRef.activeElement : null;

  return () => {
    activeElement?.focus();
  };
}
