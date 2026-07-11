import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { JClipboardService } from './clipboard.service';

describe('JClipboardService', () => {
  it('copies through the Clipboard API when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const result = await TestBed.inject(JClipboardService).copyText('Hello');

    expect(writeText).toHaveBeenCalledWith('Hello');
    expect(result.status).toBe('success');
  });

  it('returns unavailable during SSR', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const result = await TestBed.inject(JClipboardService).copyText('Hello');

    expect(result).toEqual({ status: 'unavailable', text: 'Hello' });
  });
});
