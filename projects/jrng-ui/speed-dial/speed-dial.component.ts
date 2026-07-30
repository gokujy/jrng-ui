import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  OnDestroy,
  signal,
  TemplateRef,
  viewChild,
  viewChildren,
} from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JClickOutsideDirective, jCreateId } from 'jrng-ui/core';

export type JSpeedDialDirection = 'up' | 'down' | 'left' | 'right';
export type JSpeedDialType = 'linear' | 'circle' | 'semi-circle';
export type JSpeedDialPosition = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'center';

export interface JSpeedDialAction {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly command?: () => void | Promise<void>;
}

export interface JSpeedDialActionEvent {
  readonly action: JSpeedDialAction;
  readonly index: number;
}

export interface JSpeedDialTriggerContext {
  readonly $implicit: JSpeedDialComponent;
  readonly speedDial: JSpeedDialComponent;
  readonly open: boolean;
}

@Directive({ selector: 'ng-template[jSpeedDialTrigger]' })
export class JSpeedDialTriggerDirective {
  readonly templateRef = inject<TemplateRef<JSpeedDialTriggerContext>>(TemplateRef);
}

@Component({
  selector: 'j-speed-dial',
  imports: [JButtonComponent, JClickOutsideDirective, NgTemplateOutlet],
  template: `
    @if (mask() && open()) {
      <button
        class="j-speed-dial__mask"
        type="button"
        aria-label="Close quick actions"
        (click)="close()"
      ></button>
    }
    <div
      class="j-speed-dial__root"
      tabindex="-1"
      jClickOutside
      (jClickOutside)="close()"
      (mouseenter)="onHover(true)"
      (mouseleave)="onHover(false)"
      (keydown)="onKeydown($event)"
    >
      <div class="j-speed-dial__actions" [id]="actionsId" [attr.aria-hidden]="!open()">
        @for (action of actions(); track action.id; let index = $index) {
          <div
            class="j-speed-dial__action"
            [class.is-visible]="open()"
            [style.--j-speed-x.px]="actionPosition(index).x"
            [style.--j-speed-y.px]="actionPosition(index).y"
            [style.--j-speed-delay.ms]="index * 30"
          >
            @if (showLabels()) {
              <span class="j-speed-dial__label">{{ action.label }}</span>
            }
            <j-button
              #actionButton
              actionDisplay="icon"
              shape="circle"
              [icon]="action.icon"
              [ariaLabel]="action.label"
              [title]="showLabels() ? '' : action.label"
              [disabled]="action.disabled || !open()"
              [loading]="action.loading || loadingId() === action.id"
              [tabindex]="open() ? 0 : -1"
              (onClick)="runAction(action, index)"
            />
          </div>
        }
      </div>
      <div class="j-speed-dial__trigger">
        @if (triggerTemplate()) {
          <ng-container
            [ngTemplateOutlet]="triggerTemplate()!.templateRef"
            [ngTemplateOutletContext]="triggerContext()"
          />
        } @else {
          <j-button
            #triggerButton
            actionDisplay="icon"
            shape="circle"
            [icon]="open() ? closeIcon() : icon()"
            [ariaLabel]="ariaLabel()"
            [ariaExpanded]="open()"
            [ariaControls]="actionsId"
            [disabled]="disabled()"
            (onClick)="toggle()"
          />
        }
      </div>
    </div>
  `,
  styleUrl: './speed-dial.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'j-speed-dial',
    '[class.j-speed-dial--fixed]': 'fixed()',
    '[class.j-speed-dial--open]': 'open()',
    '[attr.data-j-position]': 'position()',
    'data-jc-name': 'speed-dial',
    'data-jc-section': 'root',
    'data-jc-extend': 'trigger actions action label mask',
  },
})
export class JSpeedDialComponent implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly actions = input<readonly JSpeedDialAction[]>([]);
  readonly direction = input<JSpeedDialDirection>('up');
  readonly type = input<JSpeedDialType>('linear');
  readonly radius = input(72, { transform: numberAttribute });
  readonly fixed = input(false, { transform: booleanAttribute });
  readonly position = input<JSpeedDialPosition>('bottom-end');
  readonly mask = input(false, { transform: booleanAttribute });
  readonly hover = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly showLabels = input(false, { transform: booleanAttribute });
  readonly icon = input('plus');
  readonly closeIcon = input('close');
  readonly ariaLabel = input('Open quick actions');
  readonly open = model(false);

  readonly actionClick = output<JSpeedDialActionEvent>();
  readonly actionComplete = output<JSpeedDialActionEvent>();
  readonly actionError = output<unknown>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly triggerTemplate = contentChild(JSpeedDialTriggerDirective);
  private readonly triggerButton = viewChild<JButtonComponent>('triggerButton');
  private readonly actionButtons = viewChildren<JButtonComponent>('actionButton');
  readonly loadingId = signal('');
  readonly actionsId = jCreateId('j-speed-dial-actions');
  private hoverCloseTimer?: ReturnType<typeof setTimeout>;
  private previousFocus?: HTMLElement;

  triggerContext(): JSpeedDialTriggerContext {
    return { $implicit: this, speedDial: this, open: this.open() };
  }

  toggle(): void {
    this.open() ? this.close() : this.show();
  }

  show(): void {
    if (this.disabled() || this.open()) return;
    const activeElement = this.host.ownerDocument.activeElement;
    this.previousFocus = activeElement instanceof HTMLElement ? activeElement : undefined;
    this.open.set(true);
    this.opened.emit();
    queueMicrotask(() => this.focusAction(0));
  }

  close(restoreFocus = true): void {
    if (!this.open()) return;
    this.open.set(false);
    this.closed.emit();
    if (restoreFocus) {
      queueMicrotask(() => {
        if (this.previousFocus?.isConnected) this.previousFocus.focus();
        else this.triggerButton()?.focus();
      });
    }
  }

  async runAction(action: JSpeedDialAction, index: number): Promise<void> {
    if (action.disabled || action.loading || this.loadingId()) return;
    const event = { action, index };
    this.actionClick.emit(event);
    if (!action.command) {
      this.actionComplete.emit(event);
      this.close();
      return;
    }
    this.loadingId.set(action.id);
    try {
      await action.command();
      if (this.loadingId() !== action.id) return;
      this.loadingId.set('');
      this.actionComplete.emit(event);
      this.close();
    } catch (error) {
      if (this.loadingId() !== action.id) return;
      this.loadingId.set('');
      this.actionError.emit(error);
    }
  }

  actionPosition(index: number): { readonly x: number; readonly y: number } {
    const count = Math.max(1, this.actions().length);
    const radius = Math.max(0, this.radius());
    if (this.type() !== 'linear') {
      const spread = this.type() === 'circle' ? 360 : 180;
      const start = this.type() === 'circle' ? -90 : this.directionAngle() - spread / 2;
      const angle =
        start + (spread / (this.type() === 'circle' ? count : Math.max(1, count - 1))) * index;
      const radians = (angle * Math.PI) / 180;
      return { x: Math.cos(radians) * radius, y: Math.sin(radians) * radius };
    }
    const distance = radius * (index + 1);
    const rtl = this.host.ownerDocument.documentElement.dir === 'rtl';
    const direction =
      rtl && (this.direction() === 'left' || this.direction() === 'right')
        ? this.direction() === 'left'
          ? 'right'
          : 'left'
        : this.direction();
    return {
      x: direction === 'left' ? -distance : direction === 'right' ? distance : 0,
      y: direction === 'up' ? -distance : direction === 'down' ? distance : 0,
    };
  }

  onHover(inside: boolean): void {
    if (!this.hover() || this.disabled()) return;
    if (this.hoverCloseTimer) clearTimeout(this.hoverCloseTimer);
    if (inside) this.show();
    else this.hoverCloseTimer = setTimeout(() => this.close(false), 120);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (
      !this.open() ||
      !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
    ) {
      return;
    }
    const enabled = this.actionButtons().filter(
      (_, index) => !this.actions()[index]?.disabled && !this.actions()[index]?.loading,
    );
    if (!enabled.length) return;
    event.preventDefault();
    const active = enabled.findIndex((button) => this.isFocused(button));
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabled.length - 1
          : (Math.max(0, active) +
              (event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1) +
              enabled.length) %
            enabled.length;
    enabled[next].focus();
  }

  ngOnDestroy(): void {
    if (this.hoverCloseTimer) clearTimeout(this.hoverCloseTimer);
    this.loadingId.set('');
  }

  private focusAction(index: number): void {
    const buttons = this.actionButtons();
    const requested = buttons[index];
    const requestedAction = this.actions()[index];
    const target =
      requested && !requestedAction?.disabled && !requestedAction?.loading
        ? requested
        : buttons.find(
            (_, actionIndex) =>
              !this.actions()[actionIndex]?.disabled && !this.actions()[actionIndex]?.loading,
          );
    target?.focus();
  }

  private isFocused(button: JButtonComponent): boolean {
    return (
      this.host.ownerDocument.activeElement ===
      this.host.querySelectorAll('j-button button')[this.actionButtons().indexOf(button)]
    );
  }

  private directionAngle(): number {
    return { up: -90, right: 0, down: 90, left: 180 }[this.direction()];
  }
}
