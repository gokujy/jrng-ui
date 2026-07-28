import { TestBed } from '@angular/core/testing';
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

  it('keeps the body locked until every overlay releases its lock', () => {
    const service = TestBed.inject(JBodyScrollLockService);
    document.body.style.overflow = 'auto';

    service.lock();
    service.lock();
    expect(document.body.style.overflow).toBe('hidden');

    service.unlock();
    expect(document.body.style.overflow).toBe('hidden');

    service.unlock();
    expect(document.body.style.overflow).toBe('auto');
    document.body.style.overflow = '';
  });

  it('ignores unmatched unlocks and can clear all outstanding locks', () => {
    const service = TestBed.inject(JBodyScrollLockService);
    document.body.style.overflow = 'clip';

    service.unlock();
    expect(document.body.style.overflow).toBe('clip');

    service.lock();
    service.lock();
    service.clear();
    expect(document.body.style.overflow).toBe('clip');
    document.body.style.overflow = '';
  });
});
