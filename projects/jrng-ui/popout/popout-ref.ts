import { EventEmitter, InjectionToken, signal } from '@angular/core';

export type JPopoutState = 'opening' | 'open' | 'inline' | 'blocked' | 'unsupported' | 'closed';

export const J_POPOUT_REF = new InjectionToken<JPopoutRef>('J_POPOUT_REF');

export class JPopoutRef<T = unknown> {
  private cleaned = false;
  private cleanupCallback: (() => void) | null = null;
  private parentMessageCallback: ((message: unknown) => void) | null = null;

  readonly state = signal<JPopoutState>('opening');
  readonly closed = new EventEmitter<void>();
  readonly messageFromPopout = new EventEmitter<unknown>();
  readonly messageFromParent = new EventEmitter<unknown>();

  constructor(
    readonly id: string,
    readonly windowRef: Window | null,
    private portalInstance: T | null,
    readonly mode: 'window' | 'picture-in-picture' | 'inline' | 'none',
  ) {}

  get instance(): T | null {
    return this.portalInstance;
  }

  postMessage(message: unknown): boolean {
    if (!this.windowRef || this.state() !== 'open') return false;
    this.windowRef.postMessage({ channel: this.id, direction: 'parent', message }, '*');
    return true;
  }

  sendToParent(message: unknown): void {
    if (this.state() === 'closed') return;
    this.messageFromPopout.emit(message);
    this.parentMessageCallback?.(message);
  }

  close(): void {
    if (this.cleaned) return;
    this.cleaned = true;
    this.cleanupCallback?.();
    this.cleanupCallback = null;
    this.state.set('closed');
    this.closed.emit();
    this.closed.complete();
    this.messageFromParent.complete();
    this.messageFromPopout.complete();
  }

  focus(): boolean {
    if (!this.windowRef || this.windowRef.closed) return false;
    this.windowRef.focus();
    return true;
  }

  /** @internal */
  _setCleanup(callback: () => void): void {
    this.cleanupCallback = callback;
  }

  /** @internal */
  _setParentMessageCallback(callback: (message: unknown) => void): void {
    this.parentMessageCallback = callback;
  }

  /** @internal */
  _receiveFromParent(message: unknown): void {
    this.messageFromParent.emit(message);
  }

  /** @internal */
  _setInstance(instance: T | null): void {
    this.portalInstance = instance;
  }
}
