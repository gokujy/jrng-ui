import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  input,
  NgZone,
  numberAttribute,
  OnDestroy,
  OnInit,
  output,
  PLATFORM_ID,
} from '@angular/core';

export type JGestureDirection = 'left' | 'right' | 'up' | 'down' | 'none';
export type JPanPhase = 'start' | 'move' | 'end' | 'cancel';

export interface JGesturePoint {
  readonly x: number;
  readonly y: number;
}

export interface JSwipeEvent {
  readonly direction: Exclude<JGestureDirection, 'none'>;
  readonly distance: number;
  readonly deltaX: number;
  readonly deltaY: number;
  readonly duration: number;
  readonly velocity: number;
  readonly pointerType: string;
  readonly originalEvent: PointerEvent;
}

export interface JSwipeCancelEvent {
  readonly reason: 'threshold' | 'duration' | 'pointer-cancel' | 'disabled';
  readonly originalEvent: PointerEvent;
}

export interface JPanEvent {
  readonly phase: JPanPhase;
  readonly deltaX: number;
  readonly deltaY: number;
  readonly velocityX: number;
  readonly velocityY: number;
  readonly direction: JGestureDirection;
  readonly pointer: JGesturePoint;
  readonly pointerType: string;
  readonly originalEvent: PointerEvent;
}

export interface JZoomEvent {
  readonly scale: number;
  readonly scaleDelta: number;
  readonly center: JGesturePoint;
  readonly source: 'pinch' | 'wheel';
  readonly originalEvent: PointerEvent | WheelEvent;
}

interface JPointerState {
  readonly startX: number;
  readonly startY: number;
  readonly startTime: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  axis?: 'x' | 'y';
}

function direction(deltaX: number, deltaY: number): JGestureDirection {
  if (deltaX === 0 && deltaY === 0) return 'none';
  return Math.abs(deltaX) >= Math.abs(deltaY)
    ? deltaX < 0
      ? 'left'
      : 'right'
    : deltaY < 0
      ? 'up'
      : 'down';
}

@Directive()
abstract class JPointerDirectiveBase implements OnInit, OnDestroy {
  protected readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly zone = inject(NgZone);
  protected readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cleanup: (() => void)[] = [];

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.zone.runOutsideAngular(() => this.registerListeners());
  }

  ngOnDestroy(): void {
    this.cleanup.splice(0).forEach((remove) => remove());
  }

  protected listen<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): void {
    this.host.addEventListener(type, listener as EventListener, options);
    this.cleanup.push(() =>
      this.host.removeEventListener(type, listener as EventListener, options),
    );
  }

  protected emit(callback: () => void): void {
    this.zone.run(callback);
  }

  protected abstract registerListeners(): void;
}

@Directive({
  selector: '[jSwipe]',
  exportAs: 'jSwipe',
  host: { '[style.touch-action]': "disabled() ? null : 'pan-y'" },
})
export class JSwipeDirective extends JPointerDirectiveBase {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly distanceThreshold = input(48, { transform: numberAttribute });
  readonly velocityThreshold = input(0.1, { transform: numberAttribute });
  readonly durationThreshold = input(700, { transform: numberAttribute });
  readonly preventScrollConflict = input(true, { transform: booleanAttribute });
  readonly swipe = output<JSwipeEvent>();
  readonly swipeCancel = output<JSwipeCancelEvent>();

  private pointerId?: number;
  private state?: JPointerState;

  protected registerListeners(): void {
    this.listen('pointerdown', (event) => this.onPointerDown(event), { passive: true });
    this.listen('pointermove', (event) => this.onPointerMove(event), { passive: false });
    this.listen('pointerup', (event) => this.onPointerUp(event), { passive: true });
    this.listen('pointercancel', (event) => this.cancel('pointer-cancel', event), {
      passive: true,
    });
  }

  private onPointerDown(event: PointerEvent): void {
    if (this.disabled() || (event.pointerType === 'mouse' && event.button !== 0)) return;
    this.pointerId = event.pointerId;
    const now = performance.now();
    this.state = {
      startX: event.clientX,
      startY: event.clientY,
      startTime: now,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: now,
    };
  }

  private onPointerMove(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId || !this.state) return;
    const deltaX = event.clientX - this.state.startX;
    const deltaY = event.clientY - this.state.startY;
    if (!this.state.axis && Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 8) {
      this.state.axis = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
    }
    if (this.preventScrollConflict() && this.state.axis === 'x' && event.cancelable) {
      event.preventDefault();
    }
    this.state.lastX = event.clientX;
    this.state.lastY = event.clientY;
    this.state.lastTime = performance.now();
  }

  private onPointerUp(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId || !this.state) return;
    const state = this.state;
    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;
    const distance = Math.hypot(deltaX, deltaY);
    const duration = Math.max(1, performance.now() - state.startTime);
    const velocity = distance / duration;
    const resolvedDirection = direction(deltaX, deltaY);
    this.pointerId = undefined;
    this.state = undefined;
    if (
      resolvedDirection === 'none' ||
      distance < Math.max(0, this.distanceThreshold()) ||
      velocity < Math.max(0, this.velocityThreshold())
    ) {
      this.emit(() =>
        this.swipeCancel.emit({
          reason: 'threshold',
          originalEvent: event,
        }),
      );
      return;
    }
    if (duration > Math.max(0, this.durationThreshold())) {
      this.cancel('duration', event);
      return;
    }
    this.emit(() =>
      this.swipe.emit({
        direction: resolvedDirection,
        distance,
        deltaX,
        deltaY,
        duration,
        velocity,
        pointerType: event.pointerType,
        originalEvent: event,
      }),
    );
  }

  private cancel(reason: JSwipeCancelEvent['reason'], event: PointerEvent): void {
    if (event.pointerId !== this.pointerId && reason === 'pointer-cancel') return;
    this.pointerId = undefined;
    this.state = undefined;
    this.emit(() => this.swipeCancel.emit({ reason, originalEvent: event }));
  }
}

@Directive({
  selector: '[jPan]',
  exportAs: 'jPan',
  host: {
    '[style.touch-action]':
      "disabled() ? null : axis() === 'x' ? 'pan-y' : axis() === 'y' ? 'pan-x' : 'none'",
    '[style.user-select]': "preventTextSelection() && active ? 'none' : null",
  },
})
export class JPanDirective extends JPointerDirectiveBase {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly axis = input<'x' | 'y' | 'both'>('both');
  readonly preventTextSelection = input(true, { transform: booleanAttribute });
  readonly pan = output<JPanEvent>();
  readonly panStart = output<JPanEvent>();
  readonly panMove = output<JPanEvent>();
  readonly panEnd = output<JPanEvent>();
  readonly panCancel = output<JPanEvent>();

  active = false;
  private pointerId?: number;
  private state?: JPointerState;

  protected registerListeners(): void {
    this.listen('pointerdown', (event) => this.onPointerDown(event), { passive: true });
    this.listen('pointermove', (event) => this.onPointerMove(event), { passive: false });
    this.listen('pointerup', (event) => this.finish(event, 'end'), { passive: true });
    this.listen('pointercancel', (event) => this.finish(event, 'cancel'), { passive: true });
  }

  private onPointerDown(event: PointerEvent): void {
    if (this.disabled() || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const now = performance.now();
    this.pointerId = event.pointerId;
    this.state = {
      startX: event.clientX,
      startY: event.clientY,
      startTime: now,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: now,
    };
    this.active = true;
    this.host.setPointerCapture?.(event.pointerId);
    this.publish('start', event);
  }

  private onPointerMove(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId || !this.state) return;
    if (event.cancelable) event.preventDefault();
    this.publish('move', event);
    this.state.lastX = event.clientX;
    this.state.lastY = event.clientY;
    this.state.lastTime = performance.now();
  }

  private finish(event: PointerEvent, phase: 'end' | 'cancel'): void {
    if (event.pointerId !== this.pointerId || !this.state) return;
    this.publish(phase, event);
    if (this.host.hasPointerCapture?.(event.pointerId)) {
      this.host.releasePointerCapture(event.pointerId);
    }
    this.active = false;
    this.pointerId = undefined;
    this.state = undefined;
  }

  private publish(phase: JPanPhase, event: PointerEvent): void {
    const state = this.state;
    if (!state) return;
    const elapsed = Math.max(1, performance.now() - state.lastTime);
    let deltaX = event.clientX - state.startX;
    let deltaY = event.clientY - state.startY;
    if (this.axis() === 'x') deltaY = 0;
    if (this.axis() === 'y') deltaX = 0;
    const payload: JPanEvent = {
      phase,
      deltaX,
      deltaY,
      velocityX: (event.clientX - state.lastX) / elapsed,
      velocityY: (event.clientY - state.lastY) / elapsed,
      direction: direction(deltaX, deltaY),
      pointer: { x: event.clientX, y: event.clientY },
      pointerType: event.pointerType,
      originalEvent: event,
    };
    this.emit(() => {
      this.pan.emit(payload);
      if (phase === 'start') this.panStart.emit(payload);
      if (phase === 'move') this.panMove.emit(payload);
      if (phase === 'end') this.panEnd.emit(payload);
      if (phase === 'cancel') this.panCancel.emit(payload);
    });
  }
}

@Directive({
  selector: '[jZoom]',
  exportAs: 'jZoom',
  host: { '[style.touch-action]': "disabled() ? null : 'none'" },
})
export class JZoomDirective extends JPointerDirectiveBase {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly minScale = input(0.25, { transform: numberAttribute });
  readonly maxScale = input(4, { transform: numberAttribute });
  readonly wheelStep = input(0.1, { transform: numberAttribute });
  readonly scale = input(1, { transform: numberAttribute });
  readonly zoom = output<JZoomEvent>();

  private readonly pointers = new Map<number, JGesturePoint>();
  private pinchDistance?: number;
  private currentScale = 1;

  protected registerListeners(): void {
    this.currentScale = this.clamp(this.scale());
    this.listen('pointerdown', (event) => this.onPointer(event), { passive: true });
    this.listen('pointermove', (event) => this.onPointer(event), { passive: false });
    this.listen('pointerup', (event) => this.removePointer(event), { passive: true });
    this.listen('pointercancel', (event) => this.removePointer(event), { passive: true });
    this.listen('wheel', (event) => this.onWheel(event), { passive: false });
  }

  private onPointer(event: PointerEvent): void {
    if (this.disabled() || event.pointerType === 'mouse') return;
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.pointers.size !== 2) return;
    if (event.cancelable) event.preventDefault();
    const [first, second] = [...this.pointers.values()];
    const distance = Math.hypot(second.x - first.x, second.y - first.y);
    if (!this.pinchDistance) {
      this.pinchDistance = distance;
      return;
    }
    const scaleDelta = distance / this.pinchDistance;
    this.pinchDistance = distance;
    this.publish(
      this.currentScale * scaleDelta,
      scaleDelta,
      {
        x: (first.x + second.x) / 2,
        y: (first.y + second.y) / 2,
      },
      'pinch',
      event,
    );
  }

  private removePointer(event: PointerEvent): void {
    this.pointers.delete(event.pointerId);
    if (this.pointers.size < 2) this.pinchDistance = undefined;
  }

  private onWheel(event: WheelEvent): void {
    if (this.disabled() || !(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    const scaleDelta = event.deltaY < 0 ? 1 + this.wheelStep() : 1 - this.wheelStep();
    this.publish(
      this.currentScale * scaleDelta,
      scaleDelta,
      { x: event.clientX, y: event.clientY },
      'wheel',
      event,
    );
  }

  private publish(
    nextScale: number,
    scaleDelta: number,
    center: JGesturePoint,
    source: JZoomEvent['source'],
    originalEvent: PointerEvent | WheelEvent,
  ): void {
    const clamped = this.clamp(nextScale);
    const effectiveDelta = this.currentScale ? clamped / this.currentScale : 1;
    this.currentScale = clamped;
    this.emit(() =>
      this.zoom.emit({
        scale: clamped,
        scaleDelta: effectiveDelta || scaleDelta,
        center,
        source,
        originalEvent,
      }),
    );
  }

  private clamp(value: number): number {
    const minimum = Math.min(this.minScale(), this.maxScale());
    const maximum = Math.max(this.minScale(), this.maxScale());
    return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : 1));
  }
}
