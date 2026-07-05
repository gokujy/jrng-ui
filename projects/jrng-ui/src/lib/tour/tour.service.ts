import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';

import { JTourConfig, JTourDefaults, JTourEvent, JTourEventType, JTourStep, JTourStepInput } from './tour.types';

const DRIVER_INSTALL_MESSAGE = 'JRNG UI tour requires driver.js. Install it with: npm install driver.js';

interface JTourDriverPopover {
  readonly title?: string;
  readonly description?: string;
  readonly side?: string;
  readonly align?: string;
  readonly popoverClass?: string;
  readonly disableButtons?: readonly string[];
  readonly nextBtnText?: string;
  readonly prevBtnText?: string;
  readonly doneBtnText?: string;
  readonly closeBtnText?: string;
}

interface JTourDriverStep {
  readonly element?: string | Element;
  readonly popover?: JTourDriverPopover;
  readonly __jTourIndex?: number;
}

interface JTourDriverOptions {
  readonly steps: readonly JTourDriverStep[];
  readonly animate?: boolean;
  readonly allowClose?: boolean;
  readonly smoothScroll?: boolean;
  readonly showProgress?: boolean;
  readonly overlayColor?: string;
  readonly stagePadding?: number;
  readonly stageRadius?: number;
  readonly popoverClass?: string;
  readonly nextBtnText?: string;
  readonly prevBtnText?: string;
  readonly doneBtnText?: string;
  readonly closeBtnText?: string;
  readonly onNextClick?: () => void;
  readonly onPrevClick?: () => void;
  readonly onCloseClick?: () => void;
  readonly onDestroyed?: () => void;
  readonly onHighlightStarted?: (element?: Element, step?: JTourDriverStep) => void;
  readonly onDeselected?: (element?: Element, step?: JTourDriverStep) => void;
}

interface JTourDriver {
  drive(stepIndex?: number): void;
  moveNext(): void;
  movePrevious(): void;
  moveTo?(index: number): void;
  destroy(): void;
  isActive?(): boolean;
  getActiveIndex?(): number | undefined;
}

type JTourDriverFactory = (options: JTourDriverOptions) => JTourDriver;

@Injectable({ providedIn: 'root' })
export class JTourService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly eventsSubject = new Subject<JTourEvent>();
  private readonly registeredSteps = new Map<string, JTourStep>();
  private readonly _isActive = signal(false);
  private readonly _activeTourId = signal<string | null>(null);
  private readonly _activeIndex = signal(-1);
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
  };
  private driverFactory: JTourDriverFactory | null = null;
  private driver: JTourDriver | null = null;
  private activeConfig: JTourConfig | null = null;
  private resolvedSteps: readonly JTourStep[] = [];
  private pendingDestroyEvent = true;

  readonly events$ = this.eventsSubject.asObservable();
  readonly isActive = this._isActive.asReadonly();
  readonly activeTourId = this._activeTourId.asReadonly();
  readonly activeIndex = this._activeIndex.asReadonly();
  readonly lastError = this._lastError.asReadonly();

  setDefaults(defaults: JTourDefaults): void {
    this.defaults = { ...this.defaults, ...defaults };
  }

  registerStep(step: JTourStep): void {
    if (!step.id) {
      return;
    }

    this.registeredSteps.set(step.id, step);
  }

  unregisterStep(id: string): void {
    this.registeredSteps.delete(id);
  }

  async start(config: JTourConfig): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    const resolvedConfig = { ...this.defaults, ...config };
    const steps = config.steps.map((step) => this.resolveStep(step)).filter((step): step is JTourStep => Boolean(step));

    if (!steps.length) {
      return;
    }

    this.destroy(false);

    const factory = await this.loadDriverFactory();
    this.activeConfig = resolvedConfig;
    this.resolvedSteps = steps;
    this._activeTourId.set(resolvedConfig.id ?? null);
    this._activeIndex.set(0);
    this.pendingDestroyEvent = true;

    this.driver = factory({
      steps: steps.map((step, index) => this.toDriverStep(step, index, resolvedConfig)),
      animate: resolvedConfig.animate,
      allowClose: resolvedConfig.allowClose,
      smoothScroll: resolvedConfig.smoothScroll,
      showProgress: resolvedConfig.showProgress,
      overlayColor: resolvedConfig.overlayColor,
      stagePadding: resolvedConfig.stagePadding,
      stageRadius: resolvedConfig.stageRadius,
      popoverClass: resolvedConfig.popoverClass,
      nextBtnText: resolvedConfig.nextText,
      prevBtnText: resolvedConfig.previousText,
      doneBtnText: resolvedConfig.doneText,
      closeBtnText: resolvedConfig.closeText,
      onNextClick: () => this.next(),
      onPrevClick: () => this.previous(),
      onCloseClick: () => this.skip(),
      onDestroyed: () => this.handleDestroyed(),
      onHighlightStarted: (_element, step) => this.handleHighlight(step),
      onDeselected: (_element, step) => this.handleDeselected(step),
    });

    this._isActive.set(true);
    this.emit('start', 0);
    this.driver.drive();
  }

  next(): void {
    if (!this.driver || !this._isActive()) {
      return;
    }

    const index = this.currentIndex();
    if (index >= this.resolvedSteps.length - 1) {
      this.complete();
      return;
    }

    const nextIndex = index + 1;
    this._activeIndex.set(nextIndex);
    this.emit('next', nextIndex);
    this.driver.moveNext();
  }

  previous(): void {
    if (!this.driver || !this._isActive()) {
      return;
    }

    const previousIndex = Math.max(0, this.currentIndex() - 1);
    this._activeIndex.set(previousIndex);
    this.emit('previous', previousIndex);
    this.driver.movePrevious();
  }

  moveTo(index: number): void {
    if (!this.driver || !this._isActive()) {
      return;
    }

    const target = Math.max(0, Math.min(index, this.resolvedSteps.length - 1));
    this._activeIndex.set(target);
    if (typeof this.driver.moveTo === 'function') {
      this.driver.moveTo(target);
    } else {
      this.driver.drive(target);
    }
  }

  complete(): void {
    if (!this._isActive()) {
      return;
    }

    this.emit('complete', this.currentIndex());
    this.destroy();
  }

  skip(): void {
    if (!this._isActive()) {
      return;
    }

    this.emit('skip', this.currentIndex());
    this.destroy();
  }

  destroy(emitEvent = true): void {
    this.pendingDestroyEvent = emitEvent;

    if (this.driver) {
      const driver = this.driver;
      this.driver = null;
      driver.destroy();
      return;
    }

    this.handleDestroyed();
  }

  private resolveStep(step: JTourStepInput): JTourStep | null {
    if (typeof step === 'string') {
      return this.registeredSteps.get(step) ?? { id: step };
    }

    const registered = step.id ? this.registeredSteps.get(step.id) : null;
    return registered ? { ...registered, ...step, element: step.element ?? registered.element } : step;
  }

  private toDriverStep(step: JTourStep, index: number, config: JTourConfig): JTourDriverStep {
    return {
      element: step.element,
      __jTourIndex: index,
      popover: {
        title: step.title,
        description: step.description,
        side: step.side,
        align: step.align,
        popoverClass: step.popoverClass,
        disableButtons: step.disableButtons,
        nextBtnText: step.nextText ?? config.nextText,
        prevBtnText: step.previousText ?? config.previousText,
        doneBtnText: step.doneText ?? config.doneText,
        closeBtnText: step.closeText ?? config.closeText,
      },
    };
  }

  private async loadDriverFactory(): Promise<JTourDriverFactory> {
    if (this.driverFactory) {
      return this.driverFactory;
    }

    try {
      const importer = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<unknown>;
      const module = await importer('driver.js');
      const candidate = this.extractDriverFactory(module);

      if (!candidate) {
        throw new Error(DRIVER_INSTALL_MESSAGE);
      }

      this._lastError.set('');
      this.driverFactory = candidate;
      return candidate;
    } catch {
      this._lastError.set(DRIVER_INSTALL_MESSAGE);
      throw new Error(DRIVER_INSTALL_MESSAGE);
    }
  }

  private extractDriverFactory(module: unknown): JTourDriverFactory | null {
    if (!isRecord(module)) {
      return null;
    }

    const named = module['driver'];
    if (typeof named === 'function') {
      return named as JTourDriverFactory;
    }

    const defaultExport = module['default'];
    if (typeof defaultExport === 'function') {
      return defaultExport as JTourDriverFactory;
    }

    if (isRecord(defaultExport) && typeof defaultExport['driver'] === 'function') {
      return defaultExport['driver'] as JTourDriverFactory;
    }

    return null;
  }

  private handleHighlight(step?: JTourDriverStep): void {
    const index = this.stepIndex(step);
    this._activeIndex.set(index);
    this.emit('highlightStarted', index);
  }

  private handleDeselected(step?: JTourDriverStep): void {
    this.emit('deselected', this.stepIndex(step));
  }

  private handleDestroyed(): void {
    const shouldEmit = this.pendingDestroyEvent;
    const index = this.currentIndex();

    this.driver = null;
    this.activeConfig = null;
    this.resolvedSteps = [];
    this._isActive.set(false);
    this._activeTourId.set(null);
    this._activeIndex.set(-1);
    this.pendingDestroyEvent = true;

    if (shouldEmit) {
      this.emit('destroy', index);
    }
  }

  private currentIndex(): number {
    const driverIndex = this.driver?.getActiveIndex?.();
    if (typeof driverIndex === 'number') {
      return Math.max(0, driverIndex);
    }

    return Math.max(0, this._activeIndex());
  }

  private stepIndex(step?: JTourDriverStep): number {
    if (typeof step?.__jTourIndex === 'number') {
      return step.__jTourIndex;
    }

    return this.currentIndex();
  }

  private emit(type: JTourEventType, index: number): void {
    const event: JTourEvent = {
      type,
      tourId: this.activeConfig?.id,
      step: this.resolvedSteps[index],
      index,
    };

    this.eventsSubject.next(event);
    this.callbackFor(type)?.(event);
  }

  private callbackFor(type: JTourEventType): ((event: JTourEvent) => void) | undefined {
    switch (type) {
      case 'start':
        return this.activeConfig?.onStart;
      case 'next':
        return this.activeConfig?.onNext;
      case 'previous':
        return this.activeConfig?.onPrevious;
      case 'complete':
        return this.activeConfig?.onComplete;
      case 'skip':
        return this.activeConfig?.onSkip;
      case 'destroy':
        return this.activeConfig?.onDestroy;
      case 'highlightStarted':
        return this.activeConfig?.onHighlightStarted;
      case 'deselected':
        return this.activeConfig?.onDeselected;
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

