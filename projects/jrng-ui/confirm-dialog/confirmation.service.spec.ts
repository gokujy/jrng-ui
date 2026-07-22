import { JConfirmationService } from './confirmation.service';

describe('JConfirmationService public contract', () => {
  it('remains constructable as a public service type', () => {
    expect(typeof JConfirmationService).toBe('function');
    expect(JConfirmationService.prototype).toBeDefined();
  });

  it('does not expose duplicate public method names', () => {
    const methods = Object.getOwnPropertyNames(JConfirmationService.prototype).filter(
      (name) => name !== 'constructor',
    );
    expect(new Set(methods).size).toBe(methods.length);
  });
});
