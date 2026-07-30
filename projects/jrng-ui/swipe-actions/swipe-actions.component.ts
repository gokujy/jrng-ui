import { DOCUMENT, isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  Directive,
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

export type JSwipeActionSide = 'start' | 'end';

export interface JSwipeActionsChange {
  readonly open: boolean;
  readonly side: JSwipeActionSide | null;
}

export interface JSwipeActionEvent {
  readonly side: JSwipeActionSide;
  readonly fullSwipe: boolean;
}

@Directive({ selector: 'ng-template[jSwipeStartActions]' })
export class JSwipeStartActionsDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}

@Directive({ selector: 'ng-template[jSwipeContent]' })
export class JSwipeContentDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}

@Directive({ selector: 'ng-template[jSwipeEndActions]' })
export class JSwipeEndActionsDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}

class JSwipeActionsGroupRegistry {
  private readonly openRows = new Map<string, JSwipeActionsComponent>();

  open(group: string, row: JSwipeActionsComponent): void {
    const previous = this.openRows.get(group);
    if (previous && previous !== row) previous.close();
    this.openRows.set(group, row);
  }

  close(group: string, row: JSwipeActionsComponent): void {
    if (this.openRows.get(group) === row) this.openRows.delete(group);
  }
}

const groupRegistry = new JSwipeActionsGroupRegistry();

@Component({
  selector: 'j-swipe-actions',
  imports: [JPanDirective, NgTemplateOutlet],
  template: `
    <div
      class="j-swipe-actions__actions j-swipe-actions__actions--start"
      [attr.aria-hidden]="openSide() !== 'start'"
      [attr.inert]="openSide() === 'start' ? null : ''"
    >
      @if (startActions()) {
        <ng-container [ngTemplateOutlet]="startActions()!.templateRef" />
      }
    </div>
    <div
      class="j-swipe-actions__actions j-swipe-actions__actions--end"
      [attr.aria-hidden]="openSide() !== 'end'"
      [attr.inert]="openSide() === 'end' ? null : ''"
    >
      @if (endActions()) {
        <ng-container [ngTemplateOutlet]="endActions()!.templateRef" />
      }
    </div>
    <div
      #contentSurface
      class="j-swipe-actions__content"
      jPan
      axis="x"
      [disabled]="disabled() || readOnly() || loading()"
      [style.transform]="contentTransform()"
      [attr.tabindex]="disabled() ? -1 : 0"
      [attr.aria-expanded]="openSide() !== null"
      [attr.aria-label]="ariaLabel()"
      (panStart)="onPanStart()"
      (panMove)="onPanMove($event)"
      (panEnd)="onPanEnd($event)"
      (panCancel)="onPanCancel()"
      (keydown)="onKeydown($event)"
    >
      @if (content()) {
        <ng-container [ngTemplateOutlet]="content()!.templateRef" />
      } @else {
        <ng-content />
      }
      @if (loading()) {
        <span class="j-swipe-actions__loading" role="status">{{ loadingText() }}</span>
      }
    </div>
    <span class="j-swipe-actions__live" aria-live="polite">{{ announcement() }}</span>
  `,
  styleUrl: './swipe-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'j-swipe-actions',
    '[class.j-swipe-actions--open]': 'openSide() !== null',
    '[class.j-swipe-actions--loading]': 'loading()',
    '[class.j-swipe-actions--disabled]': 'disabled()',
    '[attr.dir]': 'direction()',
    '[style.--j-swipe-actions-width.px]': 'actionWidth()',
    'data-jc-name': 'swipe-actions',
  },
})
export class JSwipeActionsComponent implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cleanup: (() => void)[] = [];
  private dragStartOffset = 0;
  private actionRun = 0;

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly group = input('default');
  readonly direction = input<'ltr' | 'rtl'>('ltr');
  readonly openThreshold = input(0.35, { transform: numberAttribute });
  readonly fullSwipeThreshold = input(0.85, { transform: numberAttribute });
  readonly actionWidth = input(96, { transform: numberAttribute });
  readonly fullSwipe = input(false, { transform: booleanAttribute });
  readonly destructiveConfirmation = input<
    ((side: JSwipeActionSide) => boolean | Promise<boolean>) | null
  >(null);
  readonly ariaLabel = input('Swipe actions');
  readonly loadingText = input('Completing action');

  readonly openChange = output<JSwipeActionsChange>();
  readonly actionTriggered = output<JSwipeActionEvent>();
  readonly actionCompleted = output<JSwipeActionEvent>();
  readonly actionError = output<unknown>();

  readonly startActions = contentChild(JSwipeStartActionsDirective);
  readonly content = contentChild(JSwipeContentDirective);
  readonly endActions = contentChild(JSwipeEndActionsDirective);
  readonly openSide = signal<JSwipeActionSide | null>(null);
  readonly offset = signal(0);
  readonly loading = signal(false);
  readonly announcement = signal('');
  readonly contentTransform = computed(() => {
    const physical = this.offset() * (this.direction() === 'rtl' ? -1 : 1);
    return `translate3d(${physical}px, 0, 0)`;
  });

  onPanStart(): void {
    this.dragStartOffset = this.offset();
  }

  onPanMove(event: JPanEvent): void {
    const logicalDelta = event.deltaX * (this.direction() === 'rtl' ? -1 : 1);
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) return;
    const width = this.width();
    let next = this.dragStartOffset + logicalDelta;
    if (next > 0 && !this.startActions()) next = 0;
    if (next < 0 && !this.endActions()) next = 0;
    this.offset.set(Math.max(-width, Math.min(width, next)));
  }

  onPanEnd(event: JPanEvent): void {
    const width = this.width();
    const absolute = Math.abs(this.offset());
    const side: JSwipeActionSide = this.offset() >= 0 ? 'start' : 'end';
    if (
      this.fullSwipe() &&
      absolute >= width * this.clamp(this.fullSwipeThreshold()) &&
      this.templateFor(side)
    ) {
      this.offset.set(this.offset() >= 0 ? width : -width);
      void this.triggerAction(side, true);
      return;
    }
    const velocity =
      event.velocityX * (this.direction() === 'rtl' ? -1 : 1) * Math.sign(this.offset());
    if (
      absolute >= width * this.clamp(this.openThreshold()) ||
      (absolute > 12 && velocity > 0.35)
    ) {
      this.open(side);
    } else {
      this.close();
    }
  }

  onPanCancel(): void {
    if (this.openSide()) this.open(this.openSide()!);
    else this.close();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close(true);
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const physicalStart: JSwipeActionSide =
      (event.key === 'ArrowRight') !== (this.direction() === 'rtl') ? 'start' : 'end';
    if (!this.templateFor(physicalStart)) return;
    event.preventDefault();
    this.open(physicalStart);
  }

  open(side: JSwipeActionSide): void {
    if (this.disabled() || this.readOnly() || this.loading() || !this.templateFor(side)) return;
    groupRegistry.open(this.group(), this);
    this.openSide.set(side);
    this.offset.set(side === 'start' ? this.width() : -this.width());
    this.announcement.set(`${side === 'start' ? 'Start' : 'End'} actions opened.`);
    this.openChange.emit({ open: true, side });
    this.installDismissListeners();
  }

  close(restoreFocus = false): void {
    const wasOpen = this.openSide() !== null || this.offset() !== 0;
    groupRegistry.close(this.group(), this);
    this.openSide.set(null);
    this.offset.set(0);
    this.removeDismissListeners();
    if (wasOpen) this.openChange.emit({ open: false, side: null });
    if (restoreFocus) this.focusContent();
  }

  reset(): void {
    this.actionRun++;
    this.loading.set(false);
    this.close();
  }

  async triggerAction(
    side: JSwipeActionSide,
    fullSwipe = false,
    action?: () => void | Promise<void>,
  ): Promise<boolean> {
    if (this.disabled() || this.readOnly() || this.loading() || !this.templateFor(side)) {
      return false;
    }
    const run = ++this.actionRun;
    this.loading.set(true);
    this.announcement.set(this.loadingText());
    const event = { side, fullSwipe };
    try {
      const confirm = this.destructiveConfirmation();
      if (confirm && !(await confirm(side))) {
        if (run !== this.actionRun) return false;
        this.loading.set(false);
        this.close(true);
        return false;
      }
      if (run !== this.actionRun) return false;
      this.actionTriggered.emit(event);
      if (!action) {
        this.loading.set(false);
        this.close(true);
        return true;
      }
      await action();
      if (run !== this.actionRun) return false;
      this.actionCompleted.emit(event);
      this.announcement.set('Action complete.');
      this.loading.set(false);
      this.close(true);
      return true;
    } catch (error) {
      if (run !== this.actionRun) return false;
      this.actionError.emit(error);
      this.announcement.set('Action failed.');
      this.loading.set(false);
      this.open(side);
      return false;
    }
  }

  ngOnDestroy(): void {
    this.actionRun++;
    groupRegistry.close(this.group(), this);
    this.removeDismissListeners();
  }

  private templateFor(side: JSwipeActionSide): boolean {
    return side === 'start' ? Boolean(this.startActions()) : Boolean(this.endActions());
  }

  private width(): number {
    return Math.max(1, this.actionWidth());
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  private installDismissListeners(): void {
    if (!this.isBrowser || this.cleanup.length) return;
    const pointer = (event: PointerEvent): void => {
      if (!this.host.contains(event.target as Node)) this.close();
    };
    const scroll = (): void => this.close();
    this.documentRef.addEventListener('pointerdown', pointer, true);
    this.documentRef.addEventListener('scroll', scroll, true);
    this.cleanup.push(
      () => this.documentRef.removeEventListener('pointerdown', pointer, true),
      () => this.documentRef.removeEventListener('scroll', scroll, true),
    );
  }

  private removeDismissListeners(): void {
    this.cleanup.splice(0).forEach((remove) => remove());
  }

  private focusContent(): void {
    this.host.querySelector<HTMLElement>('.j-swipe-actions__content')?.focus();
  }
}
