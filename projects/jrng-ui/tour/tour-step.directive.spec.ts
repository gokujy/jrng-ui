import { JTourStepDirective } from './tour-step.directive';

describe('JTourStepDirective public contract', () => {
  const metadata = (
    JTourStepDirective as unknown as {
      ɵdir: {
        selectors: unknown[];
        inputs: Record<string, unknown>;
        outputs: Record<string, unknown>;
      };
    }
  ).ɵdir;

  it('publishes Angular directive metadata', () => {
    expect(metadata).toBeDefined();
    expect(metadata.selectors.length).toBeGreaterThan(0);
  });

  it('keeps input and output aliases unique', () => {
    expect(new Set(Object.keys(metadata.inputs)).size).toBe(Object.keys(metadata.inputs).length);
    expect(new Set(Object.keys(metadata.outputs)).size).toBe(Object.keys(metadata.outputs).length);
  });
});
