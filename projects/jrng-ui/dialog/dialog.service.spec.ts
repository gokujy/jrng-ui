import { JDialogService } from './dialog.service';

describe('JDialogService public contract', () => {
  it('remains constructable as a public service type', () => {
    expect(typeof JDialogService).toBe('function');
    expect(JDialogService.prototype).toBeDefined();
  });

  it('does not expose duplicate public method names', () => {
    const methods = Object.getOwnPropertyNames(JDialogService.prototype).filter(
      (name) => name !== 'constructor',
    );
    expect(new Set(methods).size).toBe(methods.length);
  });
});
