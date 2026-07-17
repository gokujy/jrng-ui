import { JEditorCommandService } from './editor-command.service';

describe('JEditorCommandService public contract', () => {
  it('remains constructable as a public service type', () => {
    expect(typeof JEditorCommandService).toBe('function');
    expect(JEditorCommandService.prototype).toBeDefined();
  });

  it('does not expose duplicate public method names', () => {
    const methods = Object.getOwnPropertyNames(JEditorCommandService.prototype).filter(
      (name) => name !== 'constructor',
    );
    expect(new Set(methods).size).toBe(methods.length);
  });
});
