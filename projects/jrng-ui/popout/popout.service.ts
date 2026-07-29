import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
  PLATFORM_ID,
} from '@angular/core';
import { JComponentPortal, JPortal, JTemplatePortal } from 'jrng-ui/portal';
import { JPopoutComponent } from './popout.component';
import { J_POPOUT_REF, JPopoutRef } from './popout-ref';
import { J_POPOUT_WINDOW_ADAPTER, JPopoutConfig } from './popout.types';

const DEFAULT_WIDTH = 720;
const DEFAULT_HEIGHT = 560;

@Injectable({ providedIn: 'root' })
export class JPopoutService {
  private readonly documentRef = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly adapter = inject(J_POPOUT_WINDOW_ADAPTER);
  private readonly applicationRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly injector = inject(Injector);
  private readonly refs = new Set<JPopoutRef>();
  private readonly reusableRefs = new Map<string, JPopoutRef>();
  private nextId = 0;

  readonly supported = this.adapter.supported;
  readonly pictureInPictureSupported = this.adapter.pictureInPictureSupported;

  async open<T = unknown>(portal: JPortal, config: JPopoutConfig = {}): Promise<JPopoutRef<T>> {
    const reuseKey = config.reuse ? (config.name ?? 'jrng-popout') : '';
    const reusable = reuseKey ? this.reusableRefs.get(reuseKey) : undefined;
    if (reusable?.state() === 'open') {
      reusable.focus();
      return reusable as JPopoutRef<T>;
    }
    const id = `j-popout-${++this.nextId}`;
    if (!isPlatformBrowser(this.platformId) || !this.adapter.supported) {
      return this.createUnavailableRef<T>(id, portal, config, 'unsupported');
    }

    const target = await this.openTarget(config);
    if (!target.windowRef) {
      return this.createUnavailableRef<T>(id, portal, config, 'blocked');
    }

    const previousFocus = this.documentRef.activeElement as HTMLElement | null;
    const componentRef = this.createHost(config, false);
    const ref = new JPopoutRef<T>(id, target.windowRef, null, target.mode);
    this.refs.add(ref);
    const injectedPortal = this.withPopoutInjector(portal, ref);
    const portalRef = componentRef.instance.attach(injectedPortal);
    ref._setInstance((portalRef?.instance as T | null) ?? null);
    this.prepareDocument(target.windowRef.document, config);
    for (const node of portalRef?.rootNodes ?? []) {
      target.windowRef.document.body.append(target.windowRef.document.adoptNode(node));
    }
    const cleanupTheme = this.synchronizeTheme(target.windowRef.document, config);
    const onPopupUnload = (): void => ref.close();
    const onParentUnload = (): void => ref.close();
    const onMessage = (event: MessageEvent): void => {
      const data = event.data as { channel?: string; direction?: string; message?: unknown } | null;
      if (data?.channel === id && data.direction === 'parent') ref._receiveFromParent(data.message);
    };
    target.windowRef.addEventListener('pagehide', onPopupUnload, { once: true });
    target.windowRef.addEventListener('beforeunload', onPopupUnload, { once: true });
    target.windowRef.addEventListener('message', onMessage);
    if (config.closeOnParentUnload !== false) {
      this.documentRef.defaultView?.addEventListener('beforeunload', onParentUnload, {
        once: true,
      });
    }
    ref._setCleanup(() => {
      cleanupTheme();
      target.windowRef?.removeEventListener('pagehide', onPopupUnload);
      target.windowRef?.removeEventListener('beforeunload', onPopupUnload);
      target.windowRef?.removeEventListener('message', onMessage);
      this.documentRef.defaultView?.removeEventListener('beforeunload', onParentUnload);
      portalRef?.destroy();
      this.destroyHost(componentRef);
      if (!target.windowRef?.closed) target.windowRef?.close();
      if (previousFocus?.isConnected) previousFocus.focus();
      this.refs.delete(ref);
      if (reuseKey) this.reusableRefs.delete(reuseKey);
    });
    ref.state.set('open');
    if (reuseKey) this.reusableRefs.set(reuseKey, ref);
    target.windowRef.focus();
    return ref;
  }

  closeAll(): void {
    for (const ref of [...this.refs]) ref.close();
  }

  private async openTarget(config: JPopoutConfig): Promise<{
    windowRef: Window | null;
    mode: 'window' | 'picture-in-picture';
  }> {
    const width = Math.max(240, config.width ?? DEFAULT_WIDTH);
    const height = Math.max(180, config.height ?? DEFAULT_HEIGHT);
    const mode = config.mode ?? 'auto';
    if (
      (mode === 'auto' || mode === 'picture-in-picture') &&
      this.adapter.pictureInPictureSupported
    ) {
      try {
        const pip = await this.adapter.requestPictureInPicture(width, height);
        if (pip) return { windowRef: pip, mode: 'picture-in-picture' };
      } catch {
        // The configured fallback below owns unsupported or denied PiP behavior.
      }
    }
    if (mode === 'picture-in-picture' && config.fallback !== 'window') {
      return { windowRef: null, mode: 'picture-in-picture' };
    }
    const name = config.reuse
      ? (config.name ?? 'jrng-popout')
      : `${config.name ?? 'jrng-popout'}-${Date.now()}`;
    return {
      windowRef: this.adapter.open('', name, this.windowFeatures(config, width, height)),
      mode: 'window',
    };
  }

  private createUnavailableRef<T>(
    id: string,
    portal: JPortal,
    config: JPopoutConfig,
    state: 'blocked' | 'unsupported',
  ): JPopoutRef<T> {
    const fallback = config.fallback ?? (state === 'blocked' ? 'inline' : 'none');
    if (fallback === 'inline') {
      const componentRef = this.createHost(config, true);
      const ref = new JPopoutRef<T>(id, null, null, 'inline');
      const portalRef = componentRef.instance.attach(this.withPopoutInjector(portal, ref));
      ref._setInstance((portalRef?.instance as T | null) ?? null);
      ref.state.set('inline');
      this.refs.add(ref);
      ref._setCleanup(() => {
        portalRef?.destroy();
        this.destroyHost(componentRef);
        this.refs.delete(ref);
      });
      return ref;
    }
    const ref = new JPopoutRef<T>(id, null, null, 'none');
    ref.state.set(state);
    return ref;
  }

  private createHost(config: JPopoutConfig, inline: boolean): ComponentRef<JPopoutComponent> {
    const host = this.documentRef.createElement('j-popout');
    this.documentRef.body?.append(host);
    const componentRef = createComponent(JPopoutComponent, {
      hostElement: host,
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector,
    });
    componentRef.setInput('inline', inline);
    componentRef.setInput('ariaLabel', config.ariaLabel ?? config.title ?? 'Popout content');
    this.applicationRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();
    return componentRef;
  }

  private destroyHost(componentRef: ComponentRef<JPopoutComponent>): void {
    this.applicationRef.detachView(componentRef.hostView);
    const host = componentRef.location.nativeElement as HTMLElement;
    componentRef.destroy();
    host.remove();
  }

  private withPopoutInjector(portal: JPortal, ref: JPopoutRef): JPortal {
    const parent =
      portal instanceof JComponentPortal
        ? (portal.injector ?? this.injector)
        : portal instanceof JTemplatePortal
          ? (portal.injector ?? this.injector)
          : this.injector;
    const injector = Injector.create({
      providers: [{ provide: J_POPOUT_REF, useValue: ref }],
      parent,
    });
    if (portal instanceof JComponentPortal) {
      return new JComponentPortal(
        portal.component,
        injector,
        portal.environmentInjector,
        portal.projectableNodes,
      );
    }
    if (portal instanceof JTemplatePortal) {
      return new JTemplatePortal(
        portal.templateRef,
        portal.viewContainerRef,
        portal.context,
        injector,
      );
    }
    return portal;
  }

  private prepareDocument(target: Document, config: JPopoutConfig): void {
    target.title = config.title ?? this.documentRef.title;
    target.documentElement.lang = this.documentRef.documentElement.lang;
    target.documentElement.dir = this.documentRef.documentElement.dir;
    target.body.className = this.documentRef.body?.className ?? '';
    target.body.setAttribute('data-j-popout', '');
  }

  private synchronizeTheme(target: Document, config: JPopoutConfig): () => void {
    if (config.copyStyles === false && config.syncTheme === false) return () => undefined;
    const sync = (): void => {
      if (target.defaultView?.closed) return;
      target.head.querySelectorAll('[data-j-popout-style]').forEach((element) => element.remove());
      if (config.copyStyles !== false) {
        this.documentRef.head
          .querySelectorAll<HTMLStyleElement | HTMLLinkElement>('style, link[rel="stylesheet"]')
          .forEach((element) => {
            const clone = element.cloneNode(true) as HTMLElement;
            clone.setAttribute('data-j-popout-style', '');
            target.head.append(clone);
          });
      }
      if (config.syncTheme !== false) {
        target.documentElement.className = this.documentRef.documentElement.className;
        target.documentElement.setAttribute(
          'style',
          this.documentRef.documentElement.getAttribute('style') ?? '',
        );
        for (const attribute of [...this.documentRef.documentElement.attributes]) {
          if (attribute.name.startsWith('data-j-')) {
            target.documentElement.setAttribute(attribute.name, attribute.value);
          }
        }
      }
    };
    sync();
    const Observer = this.documentRef.defaultView?.MutationObserver;
    if (!Observer) return () => undefined;
    const observer = new Observer(() => sync());
    observer.observe(this.documentRef.head, { childList: true, subtree: true });
    observer.observe(this.documentRef.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style', 'dir', 'data-j-theme', 'data-j-color-scheme'],
    });
    return () => observer.disconnect();
  }

  private windowFeatures(config: JPopoutConfig, width: number, height: number): string {
    const view = this.documentRef.defaultView;
    const left =
      config.left ??
      (config.position === 'top-left' || config.position === 'bottom-left'
        ? 0
        : config.position === 'top-right' || config.position === 'bottom-right'
          ? Math.max(0, (view?.screen.availWidth ?? width) - width)
          : Math.max(0, ((view?.screen.availWidth ?? width) - width) / 2));
    const top =
      config.top ??
      (config.position === 'top-left' || config.position === 'top-right'
        ? 0
        : config.position === 'bottom-left' || config.position === 'bottom-right'
          ? Math.max(0, (view?.screen.availHeight ?? height) - height)
          : Math.max(0, ((view?.screen.availHeight ?? height) - height) / 2));
    return [
      `width=${Math.round(width)}`,
      `height=${Math.round(height)}`,
      `left=${Math.round(left)}`,
      `top=${Math.round(top)}`,
      `resizable=${config.resizable === false ? 'no' : 'yes'}`,
      `scrollbars=${config.scrollbars === false ? 'no' : 'yes'}`,
      'noopener=no',
    ].join(',');
  }
}
