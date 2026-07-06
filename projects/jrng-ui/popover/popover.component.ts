import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
  effect,
  inject,
  model,
  output,
} from '@angular/core';
import { JClickOutsideDirective } from 'jrng-ui/core';
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
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('panel') private panel?: ElementRef<HTMLElement>;

  readonly visible = model(false);
  @Input() position: JPopoverPosition = 'bottom';
  @Input() styleClass = '';
  @Input() appendTo: 'self' | 'body' | string = 'self';
  @Input() target: HTMLElement | null = null;
  @Input({ transform: booleanAttribute }) dismissable = true;
  @Input({ transform: booleanAttribute }) closeOnEscape = true;

  readonly opened = output<void>();
  readonly closed = output<void>();

  left = 0;
  top = 0;
  zIndex = 0;

  get popoverClasses(): string {
    return ['j-popover', `j-popover--${this.position}`, this.styleClass].filter(Boolean).join(' ');
  }

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.zIndex = this.zIndexManager.next(1200);
        this.positionPanel();
        this.opened.emit();
      }
    });

    if (this.isBrowser) {
      const removeKeydown = this.renderer.listen(
        this.documentRef,
        'keydown',
        (event: KeyboardEvent) => {
          if (this.visible() && this.closeOnEscape && event.key === 'Escape') {
            event.preventDefault();
            this.hide();
          }
        },
      );
      this.destroyRef.onDestroy(removeKeydown);
    }
  }

  show(target?: HTMLElement): void {
    this.target = target ?? this.target;
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
    if (this.dismissable) {
      this.hide();
    }
  }

  private positionPanel(): void {
    if (!this.isBrowser) {
      return;
    }
    const anchor = this.target ?? this.hostRef.nativeElement;
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
    this.left = Math.max(8, positions[this.position].left);
    this.top = Math.max(8, positions[this.position].top);
    this.changeDetectorRef.markForCheck();
  }
}
