import { ChangeDetectionStrategy, Component, Input, model, output } from '@angular/core';
import { JPopoverComponent, JPopoverPosition } from 'jrng-ui/popover';

@Component({
  selector: 'j-overlay-panel',
  imports: [JPopoverComponent],
  template: `
    <j-popover
      [visible]="visible()"
      (visibleChange)="visible.set($event)"
      [position]="position"
      [styleClass]="panelClasses"
      [appendTo]="appendTo"
      [target]="target"
      [dismissable]="dismissable"
      [closeOnEscape]="closeOnEscape"
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
  @Input() styleClass = '';
  @Input() position: JPopoverPosition = 'bottom';
  @Input() appendTo: 'self' | 'body' | string = 'self';
  @Input() target: HTMLElement | null = null;
  @Input() dismissable = true;
  @Input() closeOnEscape = true;

  readonly shown = output<void>();
  readonly hidden = output<void>();

  get panelClasses(): string {
    return ['j-overlay-panel', this.styleClass].filter(Boolean).join(' ');
  }

  show(target?: HTMLElement): void {
    this.target = target ?? this.target;
    this.visible.set(true);
    this.shown.emit();
  }

  hide(): void {
    this.visible.set(false);
    this.hidden.emit();
  }

  toggle(target?: HTMLElement): void {
    this.visible() ? this.hide() : this.show(target);
  }
}
