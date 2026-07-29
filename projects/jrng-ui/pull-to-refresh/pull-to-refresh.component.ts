import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  output,
  PLATFORM_ID,
  signal,
  TemplateRef,
} from '@angular/core';
import { JPanDirective, JPanEvent } from 'jrng-ui/gesture';

export type JPullToRefreshState =
  'idle' | 'pulling' | 'ready' | 'refreshing' | 'completing' | 'disabled';

export interface JPullToRefreshStateChange {
  readonly state: JPullToRefreshState;
  readonly pullDistance: number;
  readonly progress: number;
}

export interface JPullToRefreshIndicatorContext {
  readonly $implicit: JPullToRefreshState;
  readonly state: JPullToRefreshState;
  readonly progress: number;
  readonly text: string;
}

@Component({
  selector: 'j-pull-to-refresh',
  imports: [JPanDirective, NgTemplateOutlet],
  template: `
    <div
      #surface
      class="j-pull-to-refresh__surface"
      jPan
      axis="both"
      touchAction="pan-y"
      [preventDefault]="false"
      [disabled]="disabled()"
      (panStart)="onPanStart()"
      (panMove)="onPanMove($event)"
      (panEnd)="onPanEnd()"
      (panCancel)="cancelPull()"
    >
      <div
        class="j-pull-to-refresh__indicator"
        [class.j-pull-to-refresh__indicator--visible]="pullDistance() > 0 || busy()"
        [style.transform]="indicatorTransform()"
        aria-hidden="true"
      >
        @if (indicatorTemplate()) {
          <ng-container
            [ngTemplateOutlet]="indicatorTemplate()"
            [ngTemplateOutletContext]="indicatorContext()"
          />
        } @else {
          <span class="j-pull-to-refresh__glyph" [class.j-pull-to-refresh__glyph--busy]="busy()">
            {{ busy() ? '↻' : state() === 'ready' ? '↑' : '↓' }}
          </span>
          <span>{{ indicatorText() }}</span>
        }
      </div>
      <div class="j-pull-to-refresh__content" [style.transform]="contentTransform()">
        <ng-content />
      </div>
    </div>
    <span class="j-pull-to-refresh__live" aria-live="polite" aria-atomic="true">
      {{ announcement() }}
    </span>
  `,
  styleUrl: './pull-to-refresh.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'j-pull-to-refresh',
    '[class.j-pull-to-refresh--disabled]': 'disabled()',
    '[class.j-pull-to-refresh--reduced-motion]': 'reducedMotion()',
    '[attr.data-state]': 'state()',
    '[attr.aria-busy]': 'busy()',
    'data-jc-name': 'pull-to-refresh',
  },
})
export class JPullToRefreshComponent implements OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private completionTimer?: ReturnType<typeof setTimeout>;
  private eligible = false;
  private asyncRun = 0;
  private externalRefreshing = false;

  readonly refreshing = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly threshold = input(72, { transform: numberAttribute });
  readonly maxPullDistance = input(128, { transform: numberAttribute });
  readonly resistance = input(0.55, { transform: numberAttribute });
  readonly completeDelay = input(240, { transform: numberAttribute });
  readonly pullText = input('Pull to refresh');
  readonly releaseText = input('Release to refresh');
  readonly refreshingText = input('Refreshing');
  readonly completeText = input('Refresh complete');
  readonly errorText = input('Refresh failed');
  readonly indicatorTemplate = input<TemplateRef<JPullToRefreshIndicatorContext> | null>(null);
  readonly scrollContainer = input<HTMLElement | null>(null);
  readonly refresh = input<(() => void | Promise<void>) | null>(null);

  readonly refreshRequested = output<void>();
  readonly pullProgressChange = output<number>();
  readonly stateChange = output<JPullToRefreshStateChange>();
  readonly refreshError = output<unknown>();

  readonly state = signal<JPullToRefreshState>('idle');
  readonly pullDistance = signal(0);
  readonly announcement = signal('');
  readonly reducedMotion = signal(false);
  private readonly internalRefreshing = signal(false);
  readonly busy = computed(() => this.state() === 'refreshing' || this.state() === 'completing');
  readonly progress = computed(() =>
    Math.min(1, this.pullDistance() / Math.max(1, this.threshold())),
  );
  readonly indicatorText = computed(() => {
    if (this.state() === 'ready') return this.releaseText();
    if (this.state() === 'refreshing') return this.refreshingText();
    if (this.state() === 'completing') return this.completeText();
    return this.pullText();
  });
  readonly indicatorContext = computed<JPullToRefreshIndicatorContext>(() => ({
    $implicit: this.state(),
    state: this.state(),
    progress: this.progress(),
    text: this.indicatorText(),
  }));
  readonly contentTransform = computed(() =>
    this.pullDistance() > 0 ? `translate3d(0, ${this.pullDistance()}px, 0)` : null,
  );
  readonly indicatorTransform = computed(
    () => `translate3d(0, ${Math.max(0, this.pullDistance() - 52)}px, 0)`,
  );

  constructor() {
    if (this.isBrowser) {
      this.reducedMotion.set(
        globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
      );
    }
    effect(() => {
      if (this.disabled()) {
        this.internalRefreshing.set(false);
        this.externalRefreshing = false;
        this.setState('disabled', 0);
      } else if (this.refreshing()) {
        this.externalRefreshing = true;
        this.internalRefreshing.set(true);
        this.pullDistance.set(Math.min(52, this.maxDistance()));
        this.setState('refreshing');
      } else if (this.externalRefreshing) {
        this.externalRefreshing = false;
        this.complete();
      } else if (this.state() === 'disabled') {
        this.setState('idle', 0);
      }
    });
  }

  onPanStart(): void {
    this.eligible = !this.disabled() && !this.busy() && this.atTop();
  }

  onPanMove(event: JPanEvent): void {
    if (!this.eligible || event.deltaY <= 0 || Math.abs(event.deltaX) > event.deltaY) return;
    event.originalEvent.preventDefault();
    const distance = Math.min(
      this.maxDistance(),
      Math.max(0, event.deltaY) * Math.max(0.05, Math.min(1, this.resistance())),
    );
    const nextState: JPullToRefreshState =
      distance >= Math.max(1, this.threshold()) ? 'ready' : 'pulling';
    this.pullDistance.set(distance);
    this.setState(nextState);
    this.pullProgressChange.emit(this.progress());
  }

  onPanEnd(): void {
    if (!this.eligible) return;
    this.eligible = false;
    if (this.state() === 'ready') this.requestRefresh();
    else this.reset();
  }

  cancelPull(): void {
    this.eligible = false;
    if (!this.busy()) this.reset();
  }

  beginRefresh(): void {
    if (this.disabled() || this.busy()) return;
    this.requestRefresh();
  }

  complete(message = this.completeText()): void {
    if (!this.busy() && !this.internalRefreshing()) return;
    this.internalRefreshing.set(false);
    this.pullDistance.set(Math.min(52, this.maxDistance()));
    this.announcement.set(message);
    this.setState('completing');
    this.clearCompletionTimer();
    const delay = this.reducedMotion() ? 0 : Math.max(0, this.completeDelay());
    this.completionTimer = setTimeout(() => this.reset(), delay);
  }

  reset(): void {
    this.asyncRun++;
    this.clearCompletionTimer();
    this.internalRefreshing.set(false);
    this.pullDistance.set(0);
    this.setState(this.disabled() ? 'disabled' : 'idle');
    this.pullProgressChange.emit(0);
  }

  ngOnDestroy(): void {
    this.clearCompletionTimer();
    this.asyncRun++;
  }

  private requestRefresh(): void {
    if (this.busy() || this.disabled()) return;
    this.internalRefreshing.set(true);
    this.pullDistance.set(Math.min(52, this.maxDistance()));
    this.announcement.set(this.refreshingText());
    this.setState('refreshing');
    this.refreshRequested.emit();
    const handler = this.refresh();
    if (!handler) return;
    const run = ++this.asyncRun;
    try {
      const result = handler();
      if (result && typeof (result as Promise<void>).then === 'function') {
        Promise.resolve(result).then(
          () => {
            if (run === this.asyncRun) this.complete();
          },
          (error: unknown) => {
            if (run !== this.asyncRun) return;
            this.refreshError.emit(error);
            this.complete(this.errorText());
          },
        );
      } else {
        this.complete();
      }
    } catch (error) {
      this.refreshError.emit(error);
      this.complete(this.errorText());
    }
  }

  private atTop(): boolean {
    if (!this.isBrowser) return false;
    const container = this.scrollContainer();
    if (container) return container.scrollTop <= 0;
    const owner = this.host.nativeElement.ownerDocument;
    return (owner.scrollingElement?.scrollTop ?? owner.documentElement.scrollTop) <= 0;
  }

  private setState(state: JPullToRefreshState, distance = this.pullDistance()): void {
    if (this.state() === state && distance === this.pullDistance()) return;
    this.pullDistance.set(distance);
    this.state.set(state);
    this.stateChange.emit({ state, pullDistance: distance, progress: this.progress() });
  }

  private maxDistance(): number {
    return Math.max(0, this.maxPullDistance());
  }

  private clearCompletionTimer(): void {
    if (this.completionTimer !== undefined) clearTimeout(this.completionTimer);
    this.completionTimer = undefined;
  }
}
