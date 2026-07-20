import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JDownloadService } from './download.service';

describe('JDownloadService', () => {
  it('is SSR safe and sanitizes filenames before returning', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const result = TestBed.inject(JDownloadService).downloadText('content', '../unsafe?.txt');

    expect(result).toEqual({ status: 'unavailable', filename: '..-unsafe-.txt' });
  });

  it('revokes object URLs even when activation fails', () => {
    const documentRef = document;
    const originalUrl = documentRef.defaultView?.URL;
    const createObjectURL = vi.fn(() => 'blob:fixture');
    const revokeObjectURL = vi.fn();
    const originalCreateElement = documentRef.createElement.bind(documentRef);
    const createElementSpy = vi.spyOn(documentRef, 'createElement').mockImplementation(((
      name: string,
    ) => {
      const element = originalCreateElement(name);
      if (name === 'a')
        vi.spyOn(element as HTMLAnchorElement, 'click').mockImplementation(() => {
          throw new Error('blocked');
        });
      return element;
    }) as typeof documentRef.createElement);
    Object.defineProperty(documentRef.defaultView, 'URL', {
      configurable: true,
      value: { createObjectURL, revokeObjectURL },
    });
    TestBed.configureTestingModule({ providers: [{ provide: DOCUMENT, useValue: documentRef }] });

    try {
      expect(TestBed.inject(JDownloadService).downloadText('content', 'report.txt').status).toBe(
        'failed',
      );
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:fixture');
    } finally {
      createElementSpy.mockRestore();
      Object.defineProperty(documentRef.defaultView, 'URL', {
        configurable: true,
        value: originalUrl,
      });
    }
  });
});
