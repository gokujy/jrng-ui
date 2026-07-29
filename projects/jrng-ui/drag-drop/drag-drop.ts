import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterContentInit,
  booleanAttribute,
  contentChild,
  Directive,
  EmbeddedViewRef,
  ElementRef,
  inject,
  Injectable,
  input,
  model,
  OnDestroy,
  output,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { JLiveAnnouncerService } from 'jrng-ui/core';

export type JDragDropOrientation = 'vertical' | 'horizontal';
export type JDragAxis = 'x' | 'y' | 'both';

export interface JDragStartEvent<T = unknown> {
  readonly item: JDragDirective;
  readonly data: T;
  readonly source: JDropListDirective;
}

export interface JDragMoveEvent<T = unknown> extends JDragStartEvent<T> {
  readonly pointer: { readonly x: number; readonly y: number };
  readonly delta: { readonly x: number; readonly y: number };
}

export interface JDragDropEvent<T = unknown> {
  readonly item: JDragDirective;
  readonly data: T;
  readonly previousContainer: JDropListDirective;
  readonly container: JDropListDirective;
  readonly previousIndex: number;
  readonly currentIndex: number;
  readonly isPointerOverContainer: boolean;
}

export type JDropPredicate = (item: JDragDirective, list: JDropListDirective) => boolean;

export interface JDragTemplateContext {
  readonly $implicit: unknown;
  readonly data: unknown;
}

@Directive({ selector: '[jDragHandle]', host: { class: 'j-drag-handle' } })
export class JDragHandleDirective {}

@Directive({ selector: 'ng-template[jDragPreview]' })
export class JDragPreviewDirective {
  readonly templateRef = inject<TemplateRef<JDragTemplateContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[jDragPlaceholder]' })
export class JDragPlaceholderDirective {
  readonly templateRef = inject<TemplateRef<JDragTemplateContext>>(TemplateRef);
}

@Directive({ selector: '[jDragBoundary]', exportAs: 'jDragBoundary' })
export class JDragBoundaryDirective {
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
}

@Injectable({ providedIn: 'root' })
class JDragDropRegistry {
  readonly lists = new Set<JDropListDirective>();
  active?: JDragDirective;

  listAt(x: number, y: number): JDropListDirective | undefined {
    return [...this.lists].reverse().find((list) => {
      const rect = list.element.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });
  }
}

@Directive({
  selector: '[jDropList]',
  exportAs: 'jDropList',
  host: {
    class: 'j-drop-list',
    '[class.j-drop-list--disabled]': 'disabled()',
    '[class.j-drop-list--receiving]': 'receiving',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.data-j-drop-list-id]': 'id()',
  },
})
export class JDropListDirective implements OnDestroy {
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly registry = inject(JDragDropRegistry);

  readonly id = input('');
  readonly data = model<readonly unknown[]>([]);
  readonly connectedTo = input<readonly (string | JDropListDirective)[]>([]);
  readonly orientation = input<JDragDropOrientation>('vertical');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly sortingDisabled = input(false, { transform: booleanAttribute });
  readonly autoScroll = input(true, { transform: booleanAttribute });
  readonly dropPredicate = input<JDropPredicate>(() => true);
  readonly entered = output<JDragDirective>();
  readonly exited = output<JDragDirective>();
  readonly dropped = output<JDragDropEvent>();
  receiving = false;

  constructor() {
    this.registry.lists.add(this);
  }

  accepts(item: JDragDirective): boolean {
    if (this.disabled() || !this.dropPredicate()(item, this)) return false;
    if (item.dropList === this) return true;
    const connections = this.connectedTo();
    return (
      connections.includes(item.dropList) ||
      connections.includes(item.dropList.id()) ||
      item.dropList.connectedTo().includes(this) ||
      item.dropList.connectedTo().includes(this.id())
    );
  }

  indexAt(x: number, y: number): number {
    const items = Array.from(this.element.querySelectorAll<HTMLElement>('[jDrag]')).filter(
      (item) => item !== this.registry.active?.element,
    );
    const coordinate = this.orientation() === 'vertical' ? y : x;
    const index = items.findIndex((item) => {
      const rect = item.getBoundingClientRect();
      const midpoint =
        this.orientation() === 'vertical' ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
      return coordinate < midpoint;
    });
    return index < 0 ? items.length : index;
  }

  moveItem(previousIndex: number, currentIndex: number, item: unknown): void {
    if (this.sortingDisabled()) return;
    const next = [...this.data()];
    if (previousIndex >= 0) next.splice(previousIndex, 1);
    next.splice(Math.max(0, Math.min(currentIndex, next.length)), 0, item);
    this.data.set(next);
  }

  removeItem(index: number): void {
    const next = [...this.data()];
    next.splice(index, 1);
    this.data.set(next);
  }

  ngOnDestroy(): void {
    this.registry.lists.delete(this);
  }
}

@Directive({
  selector: '[jDrag]',
  exportAs: 'jDrag',
  host: {
    class: 'j-drag',
    '[class.j-drag--disabled]': 'disabled()',
    '[class.j-drag--active]': 'active',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.aria-grabbed]': 'active',
    '[attr.tabindex]': 'disabled() ? -1 : tabindex()',
    '[attr.aria-keyshortcuts]':
      "'Control+ArrowUp Control+ArrowDown Control+ArrowLeft Control+ArrowRight Escape'",
    '(pointerdown)': 'handlePointerDown($event)',
    '(keydown)': 'handleKeydown($event)',
  },
})
export class JDragDirective implements AfterContentInit, OnDestroy {
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly dropList = inject(JDropListDirective);
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly registry = inject(JDragDropRegistry);
  private readonly announcer = inject(JLiveAnnouncerService);
  private readonly boundary = inject(JDragBoundaryDirective, { optional: true });
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly previewTemplate = contentChild(JDragPreviewDirective);
  private readonly placeholderTemplate = contentChild(JDragPlaceholderDirective);
  private cleanup: (() => void)[] = [];
  private pointerId?: number;
  private start = { x: 0, y: 0 };
  private origin = { x: 0, y: 0 };
  private previousIndex = -1;
  private target?: JDropListDirective;
  private preview?: HTMLElement;
  private placeholder?: HTMLElement;
  private previewView?: EmbeddedViewRef<JDragTemplateContext>;
  private placeholderView?: EmbeddedViewRef<JDragTemplateContext>;

  readonly data = input<unknown>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly axis = input<JDragAxis>('both');
  readonly freeDrag = input(false, { transform: booleanAttribute });
  readonly tabindex = input(0);
  readonly dragLabel = input<unknown>('Item');
  readonly dragStarted = output<JDragStartEvent>();
  readonly dragMoved = output<JDragMoveEvent>();
  readonly dragEnded = output<JDragDropEvent | null>();
  readonly dragCancelled = output<void>();
  active = false;

  ngAfterContentInit(): void {
    // Resolve optional projected templates before the first drag. The templates are
    // intentionally consumer-controlled and do not mutate the dragged content.
    this.previewTemplate();
    this.placeholderTemplate();
  }

  handlePointerDown(event: PointerEvent): void {
    const target = event.target as Element;
    const explicitHandle = target.closest('[jDragHandle]');
    if (
      !this.isBrowser ||
      this.disabled() ||
      this.dropList.disabled() ||
      (event.pointerType === 'mouse' && event.button !== 0) ||
      (!explicitHandle && this.isInteractiveTarget(target))
    ) {
      return;
    }
    const hasHandle = Boolean(this.element.querySelector('[jDragHandle]'));
    if (hasHandle && !explicitHandle) return;
    this.pointerId = event.pointerId;
    this.start = { x: event.clientX, y: event.clientY };
    const rect = this.element.getBoundingClientRect();
    this.origin = { x: rect.left, y: rect.top };
    this.previousIndex = Array.from(
      this.dropList.element.querySelectorAll<HTMLElement>('[jDrag]'),
    ).indexOf(this.element);
    const move = (moveEvent: PointerEvent): void => this.handlePointerMove(moveEvent);
    const up = (upEvent: PointerEvent): void => this.handlePointerUp(upEvent);
    const cancel = (): void => this.cancel();
    const keydown = (keyEvent: KeyboardEvent): void => {
      if (keyEvent.key === 'Escape') this.cancel();
    };
    this.documentRef.addEventListener('pointermove', move, { passive: false });
    this.documentRef.addEventListener('pointerup', up, { passive: true });
    this.documentRef.addEventListener('pointercancel', cancel, { passive: true });
    this.documentRef.addEventListener('keydown', keydown);
    this.cleanup = [
      () => this.documentRef.removeEventListener('pointermove', move),
      () => this.documentRef.removeEventListener('pointerup', up),
      () => this.documentRef.removeEventListener('pointercancel', cancel),
      () => this.documentRef.removeEventListener('keydown', keydown),
    ];
  }

  handleKeydown(event: KeyboardEvent): void {
    if (this.disabled() || !event.ctrlKey || !event.key.startsWith('Arrow')) return;
    const direction =
      event.key === 'ArrowUp' || event.key === 'ArrowLeft'
        ? -1
        : event.key === 'ArrowDown' || event.key === 'ArrowRight'
          ? 1
          : 0;
    if (!direction) return;
    event.preventDefault();
    const items = [...this.dropList.data()];
    const index = Array.from(this.dropList.element.querySelectorAll('[jDrag]')).indexOf(
      this.element,
    );
    const target = Math.max(0, Math.min(index + direction, items.length - 1));
    if (target === index || index < 0) return;
    const [item] = items.splice(index, 1);
    items.splice(target, 0, item);
    this.dropList.data.set(items);
    const payload = this.eventPayload(this.dropList, index, target, true);
    this.dropList.dropped.emit(payload);
    this.dragEnded.emit(payload);
    this.announcer.announce(`${String(this.dragLabel())} moved to position ${target + 1}.`);
    queueMicrotask(() =>
      this.dropList.element.querySelectorAll<HTMLElement>('[jDrag]')[target]?.focus(),
    );
  }

  ngOnDestroy(): void {
    this.restore();
  }

  private handlePointerMove(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) return;
    const deltaX = event.clientX - this.start.x;
    const deltaY = event.clientY - this.start.y;
    if (!this.active && Math.hypot(deltaX, deltaY) < 6) return;
    if (!this.active) this.begin();
    if (event.cancelable) event.preventDefault();
    let x = this.axis() === 'y' ? 0 : deltaX;
    let y = this.axis() === 'x' ? 0 : deltaY;
    const boundary = this.boundary?.element.getBoundingClientRect();
    const rect = this.element.getBoundingClientRect();
    if (boundary) {
      x = Math.min(
        boundary.right - this.origin.x - rect.width,
        Math.max(boundary.left - this.origin.x, x),
      );
      y = Math.min(
        boundary.bottom - this.origin.y - rect.height,
        Math.max(boundary.top - this.origin.y, y),
      );
    }
    if (this.preview) this.preview.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    const nextTarget = this.registry.listAt(event.clientX, event.clientY);
    const accepted = nextTarget?.accepts(this) ? nextTarget : undefined;
    if (accepted !== this.target) {
      if (this.target) {
        this.target.receiving = false;
        this.target.exited.emit(this);
      }
      this.target = accepted;
      if (this.target) {
        this.target.receiving = true;
        this.target.entered.emit(this);
      }
    }
    this.autoScroll(event.clientX, event.clientY);
    this.dragMoved.emit({
      item: this,
      data: this.data(),
      source: this.dropList,
      pointer: { x: event.clientX, y: event.clientY },
      delta: { x, y },
    });
  }

  private handlePointerUp(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) return;
    if (!this.active) {
      this.restore();
      return;
    }
    const target = this.target;
    if (!target) {
      this.cancel();
      return;
    }
    const currentIndex = target.indexAt(event.clientX, event.clientY);
    if (target === this.dropList) {
      target.moveItem(this.previousIndex, currentIndex, this.data());
    } else {
      this.dropList.removeItem(this.previousIndex);
      target.moveItem(-1, currentIndex, this.data());
    }
    const payload = this.eventPayload(target, this.previousIndex, currentIndex, true);
    target.dropped.emit(payload);
    this.dragEnded.emit(payload);
    this.announcer.announce(`${String(this.dragLabel())} dropped at position ${currentIndex + 1}.`);
    this.restore();
  }

  private begin(): void {
    this.active = true;
    this.registry.active = this;
    const placeholderTemplate = this.placeholderTemplate();
    if (placeholderTemplate) {
      const rendered = this.renderTemplate(placeholderTemplate.templateRef);
      this.placeholder = rendered.element;
      this.placeholderView = rendered.view;
      this.placeholder.classList.add('j-drag-placeholder');
      this.element.before(this.placeholder);
      this.element.style.visibility = 'hidden';
    } else {
      this.element.classList.add('j-drag-placeholder');
      this.placeholder = this.element;
    }
    const previewTemplate = this.previewTemplate();
    if (previewTemplate) {
      const rendered = this.renderTemplate(previewTemplate.templateRef);
      this.preview = rendered.element;
      this.previewView = rendered.view;
    } else {
      this.preview = this.element.cloneNode(true) as HTMLElement;
    }
    Object.assign(this.preview.style, {
      position: 'fixed',
      inset: '0 auto auto 0',
      left: `${this.origin.x}px`,
      top: `${this.origin.y}px`,
      width: `${this.element.getBoundingClientRect().width}px`,
      pointerEvents: 'none',
      zIndex: '10000',
    });
    this.preview.classList.add('j-drag-preview');
    this.documentRef.body.append(this.preview);
    this.dragStarted.emit({ item: this, data: this.data(), source: this.dropList });
    this.announcer.announce(`${String(this.dragLabel())} picked up. Use Escape to cancel.`);
  }

  private cancel(): void {
    if (this.active) {
      this.dragCancelled.emit();
      this.dragEnded.emit(null);
      this.announcer.announce(`${String(this.dragLabel())} movement cancelled.`);
    }
    this.restore();
  }

  private restore(): void {
    this.cleanup.splice(0).forEach((remove) => remove());
    this.preview?.remove();
    this.preview = undefined;
    this.previewView?.destroy();
    this.previewView = undefined;
    this.placeholder?.classList.remove('j-drag-placeholder');
    if (this.placeholder !== this.element) this.placeholder?.remove();
    this.placeholder = undefined;
    this.placeholderView?.destroy();
    this.placeholderView = undefined;
    this.element.style.removeProperty('visibility');
    if (this.target) this.target.receiving = false;
    this.target = undefined;
    this.active = false;
    this.pointerId = undefined;
    if (this.registry.active === this) this.registry.active = undefined;
  }

  private eventPayload(
    container: JDropListDirective,
    previousIndex: number,
    currentIndex: number,
    isPointerOverContainer: boolean,
  ): JDragDropEvent {
    return {
      item: this,
      data: this.data(),
      previousContainer: this.dropList,
      container,
      previousIndex,
      currentIndex,
      isPointerOverContainer,
    };
  }

  private isInteractiveTarget(target: Element | null): boolean {
    return Boolean(
      target?.closest(
        'button, a, input, textarea, select, option, [contenteditable="true"], [data-j-drag-ignore]',
      ),
    );
  }

  private autoScroll(x: number, y: number): void {
    if (!this.target?.autoScroll()) return;
    const element = this.target.element;
    const rect = element.getBoundingClientRect();
    const edge = 32;
    if (y < rect.top + edge) element.scrollTop -= 12;
    else if (y > rect.bottom - edge) element.scrollTop += 12;
    if (x < rect.left + edge) element.scrollLeft -= 12;
    else if (x > rect.right - edge) element.scrollLeft += 12;
  }

  private renderTemplate(templateRef: TemplateRef<JDragTemplateContext>): {
    readonly element: HTMLElement;
    readonly view: EmbeddedViewRef<JDragTemplateContext>;
  } {
    const view = this.viewContainerRef.createEmbeddedView(templateRef, {
      $implicit: this.data(),
      data: this.data(),
    });
    view.detectChanges();
    const wrapper = this.documentRef.createElement('div');
    view.rootNodes.forEach((node) => wrapper.append(node));
    return { element: wrapper, view };
  }
}
