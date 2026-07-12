import { componentDocs } from './component-docs.data';
import { generatedComponentRegistry } from './generated-component-registry';

describe('componentDocs', () => {
  it('contains one documentation page for every public component', () => {
    const documentedSlugs = new Set(componentDocs.map((doc) => doc.slug));

    for (const component of generatedComponentRegistry) {
      expect(documentedSlugs.has(component.slug)).toBe(true);
    }
  });

  it('does not publish duplicate pages for the same selector and entry point', () => {
    const identities = componentDocs.map((doc) => `${doc.importPath}::${doc.selector}`);

    expect(new Set(identities).size).toBe(identities.length);
  });

  it('keeps progress and responsive sidebar under their canonical slugs', () => {
    expect(componentDocs.some((doc) => doc.slug === 'progress')).toBe(false);
    expect(componentDocs.some((doc) => doc.slug === 'sidebar')).toBe(false);
    expect(componentDocs.some((doc) => doc.slug === 'progress-bar')).toBe(true);
    expect(componentDocs.some((doc) => doc.slug === 'responsive-sidebar')).toBe(true);
  });
});
