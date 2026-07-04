import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type JPopoverPosition = 'top' | 'right' | 'bottom' | 'left';

@Component({
  selector: 'j-popover',
  imports: [],
  template: `
    @if (visible) {
      <div [class]="popoverClasses" role="dialog">
        <div class="j-popover__arrow" aria-hidden="true"></div>
        <ng-content></ng-content>
      </div>
    }
  `,
  styles: [
    `
      .j-popover {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        box-shadow: var(--j-shadow-lg);
        color: var(--j-color-text);
        padding: var(--j-spacing-md);
        position: absolute;
        z-index: var(--j-z-index-popover);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JPopoverComponent {
  @Input({ transform: booleanAttribute }) visible = false;
  @Input() position: JPopoverPosition = 'bottom';
  @Input() styleClass = '';

  @Output() visibleChange = new EventEmitter<boolean>();

  get popoverClasses(): string {
    return ['j-popover', `j-popover--${this.position}`, this.styleClass].filter(Boolean).join(' ');
  }

  show(): void {
    this.visible = true;
    this.visibleChange.emit(true);
  }

  hide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  toggle(): void {
    this.visible ? this.hide() : this.show();
  }
}
