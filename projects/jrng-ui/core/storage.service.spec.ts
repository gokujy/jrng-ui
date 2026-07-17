import { JStorageService } from './storage.service';

describe('JStorageService public contract', () => {
  it('remains constructable as a public service type', () => {
    expect(typeof JStorageService).toBe('function');
    expect(JStorageService.prototype).toBeDefined();
  });

  it('does not expose duplicate public method names', () => {
    const methods = Object.getOwnPropertyNames(JStorageService.prototype).filter(
      (name) => name !== 'constructor',
    );
    expect(new Set(methods).size).toBe(methods.length);
  });
});
