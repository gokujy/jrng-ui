import { Component, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JPanEvent } from 'jrng-ui/gesture';
import { JPullToRefreshComponent } from './pull-to-refresh.component';

@Component({
  imports: [JPullToRefreshComponent],
  template: `
    <j-pull-to-refresh
      [disabled]="disabled()"
      [refreshing]="refreshing()"
      [threshold]="40"
      [completeDelay]="0"
      [refresh]="handler()"
      (refreshRequested)="recordRequest()"
      (refreshError)="errors.push($event)"
    >
      Customer list
    </j-pull-to-refresh>
  `,
})
class PullToRefreshHostComponent {
  @ViewChild(JPullToRefreshComponent) component!: JPullToRefreshComponent;
  readonly disabled = signal(false);
  readonly refreshing = signal(false);
  requests = 0;
  errors: unknown[] = [];
  readonly handler = signal<(() => void | Promise<void>) | null>(null);

  recordRequest(): void {
    this.requests++;
  }
}

function pan(deltaY: number): JPanEvent {
  const originalEvent = new PointerEvent('pointermove', { cancelable: true });
  return {
    phase: 'move',
    deltaX: 0,
    deltaY,
    velocityX: 0,
    velocityY: 0.4,
    direction: 'down',
    pointer: { x: 0, y: deltaY },
    pointerType: 'touch',
    originalEvent,
  };
}

describe('JPullToRefreshComponent', () => {
  let fixture: ComponentFixture<PullToRefreshHostComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PullToRefreshHostComponent);
    fixture.detectChanges();
  });

  it('renders idle content and exposes accessible busy state', () => {
    const host = fixture.nativeElement.querySelector('j-pull-to-refresh') as HTMLElement;
    expect(host.textContent).toContain('Customer list');
    expect(host.dataset['state']).toBe('idle');
    expect(host.getAttribute('aria-busy')).toBe('false');
  });

  it('moves through pulling, ready, refreshing and completion states', async () => {
    const component = fixture.componentInstance.component;
    component.onPanStart();
    component.onPanMove(pan(30));
    expect(component.state()).toBe('pulling');
    component.onPanMove(pan(100));
    expect(component.state()).toBe('ready');
    component.onPanEnd();
    expect(component.state()).toBe('refreshing');
    expect(fixture.componentInstance.requests).toBe(1);
    component.complete();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(component.state()).toBe('idle');
    expect(component.pullDistance()).toBe(0);
  });

  it('prevents duplicate refreshes and resolves async handlers', async () => {
    let resolve!: () => void;
    fixture.componentInstance.handler.set(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    fixture.detectChanges();
    const component = fixture.componentInstance.component;
    component.beginRefresh();
    component.beginRefresh();
    expect(fixture.componentInstance.requests).toBe(1);
    resolve();
    await Promise.resolve();
    await new Promise((done) => setTimeout(done, 0));
    expect(component.state()).toBe('idle');
  });

  it('announces async failures and respects disabled state', async () => {
    fixture.componentInstance.handler.set(() => Promise.reject(new Error('offline')));
    fixture.detectChanges();
    const component = fixture.componentInstance.component;
    component.beginRefresh();
    await Promise.resolve();
    expect(fixture.componentInstance.errors).toHaveLength(1);
    expect(component.announcement()).toBe('Refresh failed');
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    component.beginRefresh();
    expect(component.state()).toBe('disabled');
  });

  it('supports controlled refreshing and cancellation without duplicate requests', async () => {
    const component = fixture.componentInstance.component;
    fixture.componentInstance.refreshing.set(true);
    fixture.detectChanges();
    expect(component.state()).toBe('refreshing');
    component.beginRefresh();
    expect(fixture.componentInstance.requests).toBe(0);
    fixture.componentInstance.refreshing.set(false);
    fixture.detectChanges();
    await new Promise((done) => setTimeout(done, 0));
    expect(component.state()).toBe('idle');

    component.onPanStart();
    component.onPanMove(pan(20));
    component.cancelPull();
    expect(component.state()).toBe('idle');
    expect(component.pullDistance()).toBe(0);
  });

  it('ignores stale async completion after reset', async () => {
    let reject!: (error: unknown) => void;
    fixture.componentInstance.handler.set(
      () =>
        new Promise<void>((_resolve, rejectRefresh) => {
          reject = rejectRefresh;
        }),
    );
    fixture.detectChanges();
    const component = fixture.componentInstance.component;
    component.beginRefresh();
    component.reset();
    reject(new Error('stale'));
    await Promise.resolve();
    expect(component.state()).toBe('idle');
    expect(fixture.componentInstance.errors).toHaveLength(0);
  });
});

describe('JPullToRefreshComponent SSR', () => {
  it('creates safely without browser globals', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const fixture = TestBed.createComponent(JPullToRefreshComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.state()).toBe('idle');
    fixture.componentInstance.onPanStart();
    fixture.componentInstance.onPanMove(pan(100));
    expect(fixture.componentInstance.state()).toBe('idle');
  });
});
