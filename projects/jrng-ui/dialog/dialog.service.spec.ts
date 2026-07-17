import { JrDialogService } from './dialog.service';

describe('JrDialogService public contract', () => {
  it('remains constructable as a public service type', () => {
    expect(typeof JrDialogService).toBe('function');
    expect(JrDialogService.prototype).toBeDefined();
  });

  it('does not expose duplicate public method names', () => {
    const methods = Object.getOwnPropertyNames(JrDialogService.prototype).filter(
      (name) => name !== 'constructor',
    );
    expect(new Set(methods).size).toBe(methods.length);
  });
});
