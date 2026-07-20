import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { jPrefersReducedMotion, jRememberFocus } from 'jrng-ui/core';
import {
  JTourConfig,
  JTourDefaults,
  JTourEvent,
  JTourEventType,
  JTourStep,
  JTourStepInput,
} from './tour.types';

export interface JTourTargetRect {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

@Injectable({ providedIn: 'root' })
export class JTourService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly eventsSubject = new Subject<JTourEvent>();
  private readonly registeredSteps = new Map<string, JTourStep>();
  private readonly _isActive = signal(false);
  private readonly _activeTourId = signal<string | null>(null);
  private readonly _activeIndex = signal(-1);
  private readonly _currentStep = signal<JTourStep | null>(null);
  private readonly _targetRect = signal<JTourTargetRect | null>(null);
  private readonly _config = signal<JTourConfig | null>(null);
  private readonly _lastError = signal('');
  private defaults: JTourDefaults = {
    animate: true,
    allowClose: true,
    smoothScroll: true,
    showProgress: true,
    nextText: 'Next',
    previousText: 'Previous',
    doneText: 'Done',
    closeText: 'Close',
    stagePadding: 8,
    stageRadius: 8,
  };
  private steps: readonly JTourStep[] = [];
  private target: Element | null = null;
  private restoreFocus: (() => void) | null = null;
  private removeListeners: (() => void) | null = null;
  private runVersion = 0;

  readonly events$ = this.eventsSubject.asObservable();
  readonly isActive = this._isActive.asReadonly();
  readonly activeTourId = this._activeTourId.asReadonly();
  readonly activeIndex = this._activeIndex.asReadonly();
  readonly currentStep = this._currentStep.asReadonly();
  readonly targetRect = this._targetRect.asReadonly();
  readonly config = this._config.asReadonly();
  readonly lastError = this._lastError.asReadonly();

  constructor() {
    this.destroyRef.onDestroy(() => this.finish(false));
  }
  setDefaults(defaults: JTourDefaults): void {
    this.defaults = { ...this.defaults, ...defaults };
  }
  registerStep(step: JTourStep): void {
    if (step.id) this.registeredSteps.set(step.id, step);
  }
  unregisterStep(id: string): void {
    this.registeredSteps.delete(id);
  }

  async start(config: JTourConfig): Promise<void> {
    if (!this.browser) return;
    const merged: JTourConfig = {
      ...this.defaults,
      ...config,
      animate: config.animate ?? !jPrefersReducedMotion(this.documentRef),
    };
    const storageKey = this.storageKey(merged);
    if (
      merged.showOnce &&
      storageKey &&
      this.documentRef.defaultView?.localStorage.getItem(storageKey) === 'complete'
    )
      return;
    if ((await merged.beforeStart?.()) === false) return;
    this.finish(false);
    const version = ++this.runVersion;
    this.steps = config.steps
      .map((step) => this.resolveStep(step))
      .filter((step): step is JTourStep => !!step);
    if (!this.steps.length) return;
    this._config.set(merged);
    this._activeTourId.set(merged.id ?? null);
    this.restoreFocus = jRememberFocus(this.documentRef);
    this.installListeners();
    this._isActive.set(true);
    this.emit('start', 0);
    await this.activate(0, version);
  }

  async next(): Promise<void> {
    if (!this._isActive()) return;
    if (this._activeIndex() >= this.steps.length - 1) {
      await this.complete();
      return;
    }
    this.emit('next', this._activeIndex() + 1);
    await this.activate(this._activeIndex() + 1, this.runVersion);
  }
  async previous(): Promise<void> {
    if (this._isActive()) {
      const index = Math.max(0, this._activeIndex() - 1);
      this.emit('previous', index);
      await this.activate(index, this.runVersion);
    }
  }
  async goTo(index: number): Promise<void> {
    if (this._isActive())
      await this.activate(Math.max(0, Math.min(index, this.steps.length - 1)), this.runVersion);
  }
  moveTo(index: number): void {
    void this.goTo(index);
  }
  close(): void {
    this.skip();
  }
  highlight(step: JTourStep): void {
    void this.start({ steps: [step] });
  }
  updateSteps(steps: readonly JTourStepInput[]): void {
    this.steps = steps
      .map((step) => this.resolveStep(step))
      .filter((step): step is JTourStep => !!step);
    if (this._isActive() && !this.steps.length) this.close();
  }
  reset(id?: string): void {
    const key = id ? `jrng-tour:${id}` : this.storageKey(this._config());
    if (key) this.documentRef.defaultView?.localStorage.removeItem(key);
  }

  async complete(): Promise<void> {
    if (!this._isActive()) return;
    this.emit('complete', this._activeIndex());
    const key = this.storageKey(this._config());
    if (key) this.documentRef.defaultView?.localStorage.setItem(key, 'complete');
    await this._config()?.afterEnd?.();
    this.finish(true);
  }
  skip(): void {
    if (this._isActive()) {
      if (
        this._config()?.confirmOnExit &&
        !this.documentRef.defaultView?.confirm('Exit this tour?')
      )
        return;
      this.emit('skip', this._activeIndex());
      this.finish(true);
    }
  }
  destroy(emitEvent = true): void {
    this.finish(emitEvent);
  }

  private async activate(index: number, version: number): Promise<void> {
    const previous = this._currentStep();
    if (previous) await previous.afterLeave?.(previous);
    const step = this.steps[index];
    if (!step || version !== this.runVersion) return;
    if ((await step.beforeEnter?.(step)) === false) {
      if (index < this.steps.length - 1) await this.activate(index + 1, version);
      else this.close();
      return;
    }
    const target = await this.resolveTarget(step, version);
    if (version !== this.runVersion || !this._isActive()) return;
    if (!target && step.element) {
      const strategy = step.missingTarget ?? 'error';
      this.emitError(`Tour target was not found: ${String(step.element)}`);
      if (strategy === 'skip' && index < this.steps.length - 1) {
        await this.activate(index + 1, version);
        return;
      }
      this.finish(strategy !== 'error');
      return;
    }
    this.target = target;
    if (target && this._config()?.smoothScroll && typeof target.scrollIntoView === 'function')
      target.scrollIntoView({
        behavior: this._config()?.animate ? 'smooth' : 'auto',
        block: 'center',
        inline: 'center',
      });
    this._activeIndex.set(index);
    this._currentStep.set(step);
    this.refreshRect();
    this.emit('highlightStarted', index);
    queueMicrotask(() =>
      this.documentRef.querySelector<HTMLElement>('.j-tour-guide__popover button')?.focus(),
    );
  }

  private async resolveTarget(step: JTourStep, version: number): Promise<Element | null> {
    if (!step.element) return null;
    if (typeof step.element !== 'string') return step.element;
    const deadline = Date.now() + Math.max(0, step.waitForTargetMs ?? 0);
    while (version === this.runVersion) {
      try {
        const found = this.documentRef.querySelector(step.element);
        if (found) return found;
      } catch {
        this.emitError(`Invalid tour target selector: ${step.element}`);
        return null;
      }
      if (Date.now() >= deadline || version !== this.runVersion) break;
      await new Promise<void>((resolve) => this.documentRef.defaultView?.setTimeout(resolve, 50));
    }
    return null;
  }

  private refreshRect = (): void => {
    if (!this._isActive()) return;
    if (!this.target) {
      const view = this.documentRef.defaultView;
      this._targetRect.set({
        top: (view?.innerHeight ?? 0) / 2,
        left: (view?.innerWidth ?? 0) / 2,
        width: 0,
        height: 0,
      });
      return;
    }
    const rect = this.target.getBoundingClientRect();
    const padding = this._currentStep()?.padding ?? this._config()?.stagePadding ?? 8;
    this._targetRect.set({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });
  };

  private installListeners(): void {
    const view = this.documentRef.defaultView;
    if (!view) return;
    const key = (event: KeyboardEvent) => {
      if (!this._isActive()) return;
      if (event.key === 'Escape' && this._config()?.allowClose !== false) {
        event.preventDefault();
        this.skip();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        void this.next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        void this.previous();
      }
    };
    this.documentRef.addEventListener('keydown', key);
    view.addEventListener('resize', this.refreshRect);
    view.addEventListener('scroll', this.refreshRect, true);
    this.removeListeners = () => {
      this.documentRef.removeEventListener('keydown', key);
      view.removeEventListener('resize', this.refreshRect);
      view.removeEventListener('scroll', this.refreshRect, true);
    };
  }
  private finish(emitDestroy: boolean): void {
    const index = this._activeIndex();
    const wasActive = this._isActive();
    ++this.runVersion;
    this.removeListeners?.();
    this.removeListeners = null;
    this.target = null;
    this.steps = [];
    this._isActive.set(false);
    this._activeIndex.set(-1);
    this._activeTourId.set(null);
    this._currentStep.set(null);
    this._targetRect.set(null);
    this._config.set(null);
    if (emitDestroy && wasActive) this.emit('destroy', index);
    const restore = this.restoreFocus;
    this.restoreFocus = null;
    queueMicrotask(() => restore?.());
  }
  private resolveStep(step: JTourStepInput): JTourStep | null {
    if (typeof step === 'string') return this.registeredSteps.get(step) ?? { id: step };
    const registered = step.id ? this.registeredSteps.get(step.id) : null;
    return registered
      ? { ...registered, ...step, element: step.element ?? registered.element }
      : step;
  }
  private storageKey(config: JTourConfig | null): string | null {
    return config?.storageKey ?? (config?.id ? `jrng-tour:${config.id}` : null);
  }
  private emit(type: JTourEventType, index: number): void {
    const event: JTourEvent = { type, tourId: this._config()?.id, step: this.steps[index], index };
    this.eventsSubject.next(event);
    this.callbackFor(type)?.(event);
  }
  private callbackFor(type: JTourEventType): ((event: JTourEvent) => void) | undefined {
    const c = this._config();
    return type === 'start'
      ? c?.onStart
      : type === 'next'
        ? c?.onNext
        : type === 'previous'
          ? c?.onPrevious
          : type === 'complete'
            ? c?.onComplete
            : type === 'skip'
              ? c?.onSkip
              : type === 'destroy'
                ? c?.onDestroy
                : type === 'highlightStarted'
                  ? c?.onHighlightStarted
                  : type === 'deselected'
                    ? c?.onDeselected
                    : c?.onError;
  }
  private emitError(message: string): void {
    this._lastError.set(message);
    const event: JTourEvent = {
      type: 'error',
      tourId: this._config()?.id,
      index: -1,
      error: message,
    };
    this.eventsSubject.next(event);
    this._config()?.onError?.(event);
  }
}
