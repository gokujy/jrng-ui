import { JBodyScrollLockService } from './body-scroll-lock.service';

describe('JBodyScrollLockService public contract', () => {
  it('remains constructable as a public service type', () => {
    expect(typeof JBodyScrollLockService).toBe('function');
    expect(JBodyScrollLockService.prototype).toBeDefined();
  });

  it('does not expose duplicate public method names', () => {
    const methods = Object.getOwnPropertyNames(JBodyScrollLockService.prototype).filter(
      (name) => name !== 'constructor',
    );
    expect(new Set(methods).size).toBe(methods.length);
  });
});
