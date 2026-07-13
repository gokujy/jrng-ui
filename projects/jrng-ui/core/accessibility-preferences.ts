export function jPrefersReducedMotion(documentRef?: Document | null): boolean {
  return (
    documentRef?.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  );
}
