import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JPanDirective, JSwipeDirective, JZoomDirective } from './gesture';

@Component({
  imports: [JSwipeDirective, JPanDirective, JZoomDirective],
  template: `
    <div
      jSwipe
      (swipe)="swipes.push($event.direction)"
      (swipeCancel)="cancelled = cancelled + 1"
    ></div>
    <div jPan (pan)="panPhases.push($event.phase)"></div>
    <div jZoom (zoom)="scales.push($event.scale)"></div>
  `,
})
class GestureHostComponent {
  swipes: string[] = [];
  cancelled = 0;
  panPhases: string[] = [];
  scales: number[] = [];
}

function pointer(type: string, x: number, y: number, id = 1): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    pointerId: id,
    pointerType: 'touch',
  });
}

describe('gesture directives', () => {
  it('emits directional swipes and threshold cancellation', () => {
    const fixture = TestBed.createComponent(GestureHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.children[0] as HTMLElement;
    host.dispatchEvent(pointer('pointerdown', 100, 0));
    host.dispatchEvent(pointer('pointerup', 0, 0));
    expect(fixture.componentInstance.swipes).toEqual(['left']);
    host.dispatchEvent(pointer('pointerdown', 5, 5));
    host.dispatchEvent(pointer('pointerup', 6, 6));
    expect(fixture.componentInstance.cancelled).toBe(1);
  });

  it('emits pan lifecycle data and releases capture safely', () => {
    const fixture = TestBed.createComponent(GestureHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.children[1] as HTMLElement;
    host.setPointerCapture = vi.fn();
    host.hasPointerCapture = vi.fn(() => false);
    host.dispatchEvent(pointer('pointerdown', 0, 0));
    host.dispatchEvent(pointer('pointermove', 20, 10));
    host.dispatchEvent(pointer('pointerup', 30, 10));
    expect(fixture.componentInstance.panPhases).toEqual(['start', 'move', 'end']);
  });

  it('supports modifier-wheel zoom with clamping', () => {
    const fixture = TestBed.createComponent(GestureHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.children[2] as HTMLElement;
    host.dispatchEvent(
      new WheelEvent('wheel', { bubbles: true, cancelable: true, ctrlKey: true, deltaY: -1 }),
    );
    expect(fixture.componentInstance.scales[0]).toBeGreaterThan(1);
  });
});
