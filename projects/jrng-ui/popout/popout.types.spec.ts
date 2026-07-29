import { TestBed } from '@angular/core/testing';
import { J_POPOUT_WINDOW_ADAPTER } from './popout.types';

describe('J_POPOUT_WINDOW_ADAPTER', () => {
  it('provides a browser capability abstraction', () => {
    const adapter = TestBed.inject(J_POPOUT_WINDOW_ADAPTER);
    expect(typeof adapter.supported).toBe('boolean');
    expect(typeof adapter.pictureInPictureSupported).toBe('boolean');
    expect(adapter.open).toBeTypeOf('function');
  });
});
