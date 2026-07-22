import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JFullscreenService } from './fullscreen.service';

describe('JFullscreenService', () => {
  it('returns safe unsupported results during SSR', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const service = TestBed.inject(JFullscreenService);

    expect(service.supported()).toBe(false);
    await expect(service.enter()).resolves.toBe(false);
    await expect(service.exit()).resolves.toBe(false);
  });

  it('removes its fullscreen listener when its injector is destroyed', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    TestBed.configureTestingModule({ providers: [{ provide: DOCUMENT, useValue: document }] });
    TestBed.inject(JFullscreenService);
    const registration = add.mock.calls.find(([name]) => name === 'fullscreenchange');

    TestBed.resetTestingModule();

    expect(registration).toBeDefined();
    expect(remove).toHaveBeenCalledWith('fullscreenchange', registration?.[1]);
  });
});
