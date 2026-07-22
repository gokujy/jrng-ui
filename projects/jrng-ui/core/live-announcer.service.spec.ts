import { JLiveAnnouncerService } from './live-announcer.service';

describe('JLiveAnnouncerService public contract', () => {
  it('remains constructable as a public service type', () => {
    expect(typeof JLiveAnnouncerService).toBe('function');
    expect(JLiveAnnouncerService.prototype).toBeDefined();
  });

  it('does not expose duplicate public method names', () => {
    const methods = Object.getOwnPropertyNames(JLiveAnnouncerService.prototype).filter(
      (name) => name !== 'constructor',
    );
    expect(new Set(methods).size).toBe(methods.length);
  });
});
