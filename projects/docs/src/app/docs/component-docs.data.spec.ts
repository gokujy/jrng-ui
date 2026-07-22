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

  it('omits filler TypeScript for examples that require no backing state', () => {
    for (const doc of componentDocs) {
      expect(doc.code.angular, `${doc.slug} example values`).toBeDefined();
      expect(doc.code.angular).not.toMatch(/static example|no backing fields are required/i);
    }
  });

  it('includes every basic-template binding identifier in its example values', () => {
    for (const doc of componentDocs) {
      const fields = [...doc.code.basic.matchAll(/(?:\[[^\]]+\])="([^"]+)"/g)]
        .map((match) => (match[1] ?? '').trim())
        .filter(
          (expression) =>
            /^[A-Za-z_$][\w$]*/.test(expression) &&
            !/^(?:true|false|null|undefined)$/.test(expression),
        )
        .map((expression) => expression.match(/^([A-Za-z_$][\w$]*)/)?.[1])
        .filter((field): field is string => !!field && field !== '$event');

      for (const field of fields) {
        expect(doc.code.angular, `${doc.slug} should define ${field}`).toContain(field);
      }
    }
  });

  it('includes method stubs for event handlers used by basic templates', () => {
    for (const doc of componentDocs) {
      const methods = [...doc.code.basic.matchAll(/\([^)]+\)="([A-Za-z_$][\w$]*)\s*\(/g)]
        .map((match) => match[1])
        .filter((method): method is string => !!method);

      for (const method of methods) {
        expect(doc.code.angular, `${doc.slug} should define ${method}()`).toMatch(
          new RegExp(`\\b${method}\\s*\\(`),
        );
      }
    }
  });

  it('documents every generated public input, output, and method', () => {
    for (const component of generatedComponentRegistry) {
      const doc = componentDocs.find((candidate) => candidate.slug === component.slug);
      expect(doc, `${component.slug} documentation`).toBeDefined();
      const inputNames = new Set(doc?.inputs.flatMap((row) => row.name.split(/\s*\/\s*/)));
      const outputNames = new Set(doc?.outputs.flatMap((row) => row.event.split(/\s*\/\s*/)));
      const methodText = (doc?.publicMethods ?? []).join(' ');
      for (const input of component.inputs) {
        expect(inputNames.has(input), `${component.slug} input ${input}`).toBe(true);
      }
      for (const output of component.outputs) {
        expect(outputNames.has(output), `${component.slug} output ${output}`).toBe(true);
      }
      for (const method of component.methods) {
        expect(methodText, `${component.slug} method ${method}`).toContain(method);
      }
    }
  });

  it('provides a concise technical contract and focused examples for every page', () => {
    for (const doc of componentDocs) {
      expect(doc.description.trim().length, `${doc.slug} purpose`).toBeGreaterThan(0);
      expect(doc.whenToUse.trim().length, `${doc.slug} technical summary`).toBeGreaterThan(0);
      expect(doc.usage.length, `${doc.slug} integration notes`).toBeGreaterThan(0);
      expect(doc.accessibility.length, `${doc.slug} accessibility`).toBeGreaterThan(0);
      expect(doc.keyboard?.length, `${doc.slug} keyboard`).toBeGreaterThan(0);
      expect(doc.responsive?.length, `${doc.slug} responsive`).toBeGreaterThan(0);
      expect(doc.testingNotes?.length, `${doc.slug} testing notes`).toBeGreaterThan(0);
      expect(doc.code.basic.trim().length, `${doc.slug} basic code`).toBeGreaterThan(0);
    }
  });
});
