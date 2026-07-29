import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  EmbeddedViewRef,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
  input,
  OnDestroy,
  output,
  PLATFORM_ID,
  TemplateRef,
  Type,
  ViewContainerRef,
} from '@angular/core';

export type JPortal = JTemplatePortal<unknown> | JComponentPortal<unknown> | JDomPortal;

export class JTemplatePortal<T = unknown> {
  constructor(
    readonly templateRef: TemplateRef<T>,
    readonly viewContainerRef: ViewContainerRef,
    readonly context?: T,
    readonly injector?: Injector,
  ) {}
}

export class JComponentPortal<T> {
  constructor(
    readonly component: Type<T>,
    readonly injector?: Injector,
    readonly environmentInjector?: EnvironmentInjector,
    readonly projectableNodes?: Node[][],
  ) {}
}

export class JDomPortal {
  constructor(readonly element: HTMLElement) {}
}

export class JPortalRef<T = unknown> {
  private attached = true;
  private destroyed = false;

  constructor(
    readonly instance: T | null,
    private readonly detachCallback: () => void,
    private readonly destroyCallback: () => void = detachCallback,
  ) {}

  get isAttached(): boolean {
    return this.attached && !this.destroyed;
  }

  detach(): void {
    if (!this.isAttached) return;
    this.attached = false;
    this.detachCallback();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.attached = false;
    this.destroyCallback();
  }
}

@Directive({
  selector: '[jPortalOutlet]',
  exportAs: 'jPortalOutlet',
})
export class JPortalOutletDirective implements OnDestroy {
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly injector = inject(Injector);
  private currentPortal?: JPortal;
  private currentRef?: JPortalRef;

  readonly attached = output<JPortalRef>();
  readonly detached = output<void>();

  get hasAttached(): boolean {
    return Boolean(this.currentRef?.isAttached);
  }

  attach<T>(portal: JTemplatePortal<T>): JPortalRef<EmbeddedViewRef<T>>;
  attach<T>(portal: JComponentPortal<T>): JPortalRef<T>;
  attach(portal: JDomPortal): JPortalRef<HTMLElement>;
  attach(portal: JPortal): JPortalRef;
  attach(portal: JPortal): JPortalRef {
    if (this.currentRef?.isAttached || this.currentPortal === portal) {
      throw new Error('A portal is already attached to this outlet.');
    }
    this.currentPortal = portal;
    const ref =
      portal instanceof JTemplatePortal
        ? this.attachTemplate(portal)
        : portal instanceof JComponentPortal
          ? this.attachComponent(portal)
          : this.attachDom(portal);
    this.currentRef = ref;
    this.attached.emit(ref);
    return ref;
  }

  replace(portal: JPortal): JPortalRef {
    this.detach();
    return this.attach(portal);
  }

  detach(): void {
    if (!this.currentRef) return;
    const ref = this.currentRef;
    this.currentRef = undefined;
    this.currentPortal = undefined;
    ref.detach();
    this.detached.emit();
  }

  ngOnDestroy(): void {
    this.currentRef?.destroy();
    this.currentRef = undefined;
    this.currentPortal = undefined;
  }

  private attachTemplate<T>(portal: JTemplatePortal<T>): JPortalRef<EmbeddedViewRef<T>> {
    const view = this.viewContainerRef.createEmbeddedView(
      portal.templateRef,
      portal.context,
      portal.injector ? { injector: portal.injector } : undefined,
    );
    return new JPortalRef(view, () => view.destroy());
  }

  private attachComponent<T>(portal: JComponentPortal<T>): JPortalRef<T> {
    const componentRef = this.viewContainerRef.createComponent(portal.component, {
      injector: portal.injector ?? this.injector,
      environmentInjector: portal.environmentInjector ?? this.environmentInjector,
      projectableNodes: portal.projectableNodes,
    });
    return new JPortalRef(componentRef.instance, () => componentRef.destroy());
  }

  private attachDom(portal: JDomPortal): JPortalRef<HTMLElement> {
    const element = portal.element;
    const parent = element.parentNode;
    const nextSibling = element.nextSibling;
    const placeholder = element.ownerDocument.createComment('j-dom-portal');
    parent?.insertBefore(placeholder, element);
    const outletElement = this.viewContainerRef.element.nativeElement as Node;
    outletElement.parentNode?.insertBefore(element, outletElement.nextSibling);
    const restore = (): void => {
      if (placeholder.parentNode) {
        placeholder.parentNode.insertBefore(element, placeholder);
        placeholder.remove();
      } else if (parent) {
        parent.insertBefore(element, nextSibling);
      }
    };
    return new JPortalRef(element, restore, restore);
  }
}

@Directive({
  selector: 'ng-template[jPortal]',
  exportAs: 'jPortal',
})
export class JPortalDirective<T = unknown> implements OnDestroy {
  private readonly templateRef = inject<TemplateRef<T>>(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private ref?: JPortalRef;

  readonly jPortal = input<JPortalOutletDirective | null>(null);
  readonly jPortalContext = input<T | undefined>(undefined);

  attach(outlet = this.jPortal()): JPortalRef | null {
    if (!outlet) return null;
    this.ref?.destroy();
    this.ref = outlet.attach(
      new JTemplatePortal(this.templateRef, this.viewContainerRef, this.jPortalContext()),
    );
    return this.ref;
  }

  detach(): void {
    this.ref?.detach();
    this.ref = undefined;
  }

  ngOnDestroy(): void {
    this.ref?.destroy();
  }
}

@Injectable({ providedIn: 'root' })
export class JPortalService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  attach(outlet: JPortalOutletDirective, portal: JPortal): JPortalRef | null {
    return this.isBrowser || !(portal instanceof JDomPortal) ? outlet.attach(portal) : null;
  }

  replace(outlet: JPortalOutletDirective, portal: JPortal): JPortalRef | null {
    return this.isBrowser || !(portal instanceof JDomPortal) ? outlet.replace(portal) : null;
  }

  detach(outlet: JPortalOutletDirective): void {
    outlet.detach();
  }
}
