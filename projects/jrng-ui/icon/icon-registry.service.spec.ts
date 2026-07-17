import { JIconRegistry } from './icon-registry.service';

describe('JIconRegistry public contract', () => {
  it('remains constructable as a public service type', () => {
    expect(typeof JIconRegistry).toBe('function');
    expect(JIconRegistry.prototype).toBeDefined();
  });

  it('does not expose duplicate public method names', () => {
    const methods = Object.getOwnPropertyNames(JIconRegistry.prototype).filter(
      (name) => name !== 'constructor',
    );
    expect(new Set(methods).size).toBe(methods.length);
  });
});
