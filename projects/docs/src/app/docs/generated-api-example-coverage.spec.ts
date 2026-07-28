import { generatedApiExampleCoverage } from './generated-api-example-coverage';
import { generatedComponentRegistry } from './generated-component-registry';

describe('generated API example coverage', () => {
  it('contains runnable API examples for every public component', () => {
    expect(generatedApiExampleCoverage.components).toHaveLength(generatedComponentRegistry.length);

    for (const component of generatedComponentRegistry) {
      const coverage = generatedApiExampleCoverage.components.find(
        (candidate) => candidate.selector === component.selector,
      );
      expect(coverage, component.selector).toBeDefined();
      expect(
        (coverage?.existingExamples ?? 0) + (coverage?.examples.length ?? 0),
        component.selector,
      ).toBeGreaterThan(0);
    }
  });

  it('keeps displayed HTML aligned with mapped inputs and outputs', () => {
    for (const component of generatedApiExampleCoverage.components) {
      for (const example of component.examples) {
        expect(example.html, `${component.selector}:${example.key}`).toContain(
          `<${component.selector}`,
        );
        for (const input of example.inputs) {
          expect(example.html, `${component.selector}:${example.key}:${input}`).toContain(
            `[${input}]=`,
          );
        }
        for (const output of example.outputs) {
          expect(example.html, `${component.selector}:${example.key}:${output}`).toContain(
            `(${output})=`,
          );
        }
      }
    }
  });

  it('uses unique example IDs and independent wrapper instances', () => {
    const ids = generatedApiExampleCoverage.components.flatMap((component) =>
      component.examples.map((example) => `${component.selector}:${example.key}`),
    );

    expect(new Set(ids).size).toBe(ids.length);
  });
});
