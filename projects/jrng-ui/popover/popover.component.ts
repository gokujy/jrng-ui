import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
  effect,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { JClickOutsideDirective } from 'jrng-ui/core';
import {
  JAppendTo,
  JOverlayHandle,
  JOverlayService,
  JOverlayStackService,
} from 'jrng-ui/core';
import { JZIndexManagerService } from 'jrng-ui/core';

export type JPopoverPosition = 'top' | 'right' | 'bottom' | 'left';

@Component({
  selector: 'j-popover',
  imports: [JClickOutsideDirective],
  template: `
    @if (visible()) {
      <div
        #panel
        [class]="popoverClasses"
        jClickOutside
        (jClickOutside)="handleOutside()"
        role="dialog"
        [attr.aria-label]="ariaLabel() || null"
        data-jc-name="popover"
        data-jc-section="root"
        data-j-open="true"
        [style.left.px]="left"
        [style.top.px]="top"
        [style.z-index]="zIndex || null"
      >
        <div class="j-popover__arrow" aria-hidden="true"></div>
        <ng-content></ng-content>
      </div>
    }
  `,
  styles: [
    `
      .j-popover {
        background: var(--j-color-popover);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        box-shadow: var(--j-shadow-lg);
        color: var(--j-color-popover-foreground);
        min-width: 12rem;
        padding: var(--j-spacing-md);
        position: fixed;
        z-index: var(--j-z-index-popover);
      }

      .j-popover:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-popover__arrow {
        background: var(--j-color-popover);
        border: 1px solid var(--j-color-border);
        height: 0.75rem;
        position: absolute;
        transform: rotate(45deg);
        width: 0.75rem;
      }

      .j-popover--bottom .j-popover__arrow {
        border-bottom: 0;
        border-right: 0;
        left: 1.25rem;
        top: -0.42rem;
      }

      .j-popover--top .j-popover__arrow {
        border-left: 0;
        border-top: 0;
        bottom: -0.42rem;
        left: 1.25rem;
      }

      .j-popover--right .j-popover__arrow {
        border-right: 0;
        border-top: 0;
        left: -0.42rem;
        top: 1.25rem;
      }

      .j-popover--left .j-popover__arrow {
        border-bottom: 0;
        border-left: 0;
        right: -0.42rem;
        top: 1.25rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JPopoverComponent {
  private readonly documentRef = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zIndexManager = inject(JZIndexManagerService);
  private readonly overlayStack = inject(JOverlayStackService);
  private readonly overlay = inject(JOverlayService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('panel') private panel?: ElementRef<HTMLElement>;

  readonly visible = model(false);
  readonly position = input<JPopoverPosition>('bottom');
  readonly styleClass = input('');
  readonly appendTo = input<JAppendTo | undefined>(undefined);
  // `target` is also set imperatively via show(), so it is a model (writable).
  readonly target = model<HTMLElement | null>(null);
  readonly dismissable = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  /** Accessible label for the popover dialog (screen readers). */
  readonly ariaLabel = input('');

  readonly opened = output<void>();
  readonly closed = output<void>();

  left = 0;
  top = 0;
  zIndex = 0;
  private removeReposition?: () => void;
  private overlayHandle?: JOverlayHandle;

  get popoverClasses(): string {
    return ['j-popover', `j-popover--${this.position()}`, this.styleClass()]
      .filter(Boolean)
      .join(' ');
  }

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.zIndex = this.zIndexManager.next(1200);
        this.overlayStack.push(this);
        this.positionPanel();
        this.attachRepositionListeners();
        queueMicrotask(() => {
          const panel = this.panel?.nativeElement;
          if (panel) this.overlayHandle = this.overlay.portal(panel, this.appendTo());
          this.positionPanel();
        });
        this.opened.emit();
      } else {
        this.overlayStack.remove(this);
        this.detachRepositionListeners();
        this.overlayHandle?.detach();
        this.overlayHandle = undefined;
      }
    });

    if (this.isBrowser) {
      const removeKeydown = this.renderer.listen(
        this.documentRef,
        'keydown',
        (event: KeyboardEvent) => {
          // Only the front-most overlay should respond to Escape.
          if (
            this.visible() &&
            this.closeOnEscape() &&
            event.key === 'Escape' &&
            this.overlayStack.isTopmost(this)
          ) {
            event.preventDefault();
            this.hide();
          }
        },
      );
      this.destroyRef.onDestroy(removeKeydown);
    }

    this.destroyRef.onDestroy(() => {
      this.overlayStack.remove(this);
      this.detachRepositionListeners();
      this.overlayHandle?.detach();
    });
  }

  show(target?: HTMLElement): void {
    this.target.set(target ?? this.target());
    this.visible.set(true);
    queueMicrotask(() => this.positionPanel());
  }

  hide(): void {
    if (!this.visible()) {
      return;
    }
    this.visible.set(false);
    this.closed.emit();
  }

  toggle(target?: HTMLElement): void {
    this.visible() ? this.hide() : this.show(target);
  }

  handleOutside(): void {
    if (this.dismissable()) {
      this.hide();
    }
  }

  private positionPanel(): void {
    if (!this.isBrowser) {
      return;
    }
    const anchor = this.target() ?? this.hostRef.nativeElement;
    const rect = anchor.getBoundingClientRect();
    const panelRect = this.panel?.nativeElement.getBoundingClientRect();
    const width = panelRect?.width ?? 240;
    const height = panelRect?.height ?? 120;
    const gap = 8;
    const positions: Record<JPopoverPosition, { readonly left: number; readonly top: number }> = {
      bottom: { left: rect.left, top: rect.bottom + gap },
      top: { left: rect.left, top: rect.top - height - gap },
      right: { left: rect.right + gap, top: rect.top },
      left: { left: rect.left - width - gap, top: rect.top },
    };
    this.left = Math.max(8, positions[this.position()].left);
    this.top = Math.max(8, positions[this.position()].top);
    this.changeDetectorRef.markForCheck();
  }

  private attachRepositionListeners(): void {
    const view = this.documentRef.defaultView;
    if (!this.isBrowser || !view || this.removeReposition) {
      return;
    }
    // Keep the panel anchored while the page scrolls/resizes (it is position:fixed).
    const reposition = (): void => this.positionPanel();
    view.addEventListener('scroll', reposition, true);
    view.addEventListener('resize', reposition);
    this.removeReposition = () => {
      view.removeEventListener('scroll', reposition, true);
      view.removeEventListener('resize', reposition);
    };
  }

  private detachRepositionListeners(): void {
    this.removeReposition?.();
    this.removeReposition = undefined;
  }
}
