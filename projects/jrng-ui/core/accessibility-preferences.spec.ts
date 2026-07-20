import { jPrefersReducedMotion } from './accessibility-preferences';
import { jIsBrowserDocument } from './dom';

describe('SSR and motion preferences', () => {
  it('is safe without a browser document', () => {
    expect(jIsBrowserDocument(null)).toBe(false);
    expect(jPrefersReducedMotion(null)).toBe(false);
  });
  it('reads reduced motion from the owning window', () => {
    const documentRef = {
      defaultView: { matchMedia: () => ({ matches: true }) },
    } as unknown as Document;
    expect(jPrefersReducedMotion(documentRef)).toBe(true);
  });
});
