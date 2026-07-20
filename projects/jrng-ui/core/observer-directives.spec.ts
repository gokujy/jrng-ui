import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JIntersectionObserverDirective, JResizeObserverDirective } from './observer-directives';

@Component({
  standalone: true,
  imports: [JIntersectionObserverDirective, JResizeObserverDirective],
  template: '<div jResizeObserver jIntersectionObserver></div>',
})
class ObserverFixture {}

describe('observer directives', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('disconnects resize and intersection observers on destroy', async () => {
    const resizeDisconnect = vi.fn();
    const intersectionDisconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn();
        disconnect = resizeDisconnect;
      },
    );
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn();
        disconnect = intersectionDisconnect;
      },
    );
    await TestBed.configureTestingModule({ imports: [ObserverFixture] }).compileComponents();

    const fixture = TestBed.createComponent(ObserverFixture);
    fixture.detectChanges();
    fixture.destroy();

    expect(resizeDisconnect).toHaveBeenCalledOnce();
    expect(intersectionDisconnect).toHaveBeenCalledOnce();
  });
});
