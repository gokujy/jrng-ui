import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JDownloadService } from './download.service';
import { JFullscreenService } from './fullscreen.service';
import { JPrintService } from './print.service';
describe('browser utility SSR safety', () => {
  it('reports unavailable without browser APIs', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    expect(TestBed.inject(JDownloadService).downloadText('x', 'x.txt').status).toBe('unavailable');
    expect(TestBed.inject(JPrintService).printHtml('<p>x</p>')).toBe(false);
    expect(await TestBed.inject(JFullscreenService).enter()).toBe(false);
  });
});
