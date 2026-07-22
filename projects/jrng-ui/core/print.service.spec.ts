import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JPrintService } from './print.service';

describe('JPrintService', () => {
  it('does not open a window or call hooks during SSR', () => {
    const beforePrint = vi.fn();
    const afterPrint = vi.fn();
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    const printed = TestBed.inject(JPrintService).printHtml('<script>alert(1)</script>', {
      beforePrint,
      afterPrint,
    });

    expect(printed).toBe(false);
    expect(beforePrint).not.toHaveBeenCalled();
    expect(afterPrint).not.toHaveBeenCalled();
  });
});
