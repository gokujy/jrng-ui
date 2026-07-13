import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { JPopoverComponent, JPopoverPosition } from 'jrng-ui/popover';

@Component({
  selector: 'j-overlay-panel',
  imports: [JPopoverComponent],
  template: `
    <j-popover
      [visible]="visible()"
      (visibleChange)="visible.set($event)"
      [position]="position()"
      [styleClass]="panelClasses"
      [appendTo]="appendTo()"
      [target]="target()"
      [dismissable]="dismissable()"
      [closeOnEscape]="closeOnEscape()"
      (opened)="shown.emit()"
      (closed)="hidden.emit()"
    >
      <ng-content></ng-content>
    </j-popover>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JOverlayPanelComponent {
  readonly visible = model(false);
  readonly styleClass = input('');
  readonly position = input<JPopoverPosition>('bottom');
  readonly appendTo = input<'self' | 'body' | string>('self');
  // `target` is also set imperatively via show(), so it is a model (writable).
  readonly target = model<HTMLElement | null>(null);
  readonly dismissable = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });

  readonly shown = output<void>();
  readonly hidden = output<void>();

  get panelClasses(): string {
    return ['j-overlay-panel', this.styleClass()].filter(Boolean).join(' ');
  }

  show(target?: HTMLElement): void {
    this.target.set(target ?? this.target());
    // `shown`/`hidden` are emitted via the popover's (opened)/(closed) bindings,
    // so we must not emit them here as well or consumers get duplicate events.
    this.visible.set(true);
  }

  hide(): void {
    this.visible.set(false);
  }

  toggle(target?: HTMLElement): void {
    this.visible() ? this.hide() : this.show(target);
  }
}
