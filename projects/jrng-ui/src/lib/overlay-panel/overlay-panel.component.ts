import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { JClickOutsideDirective } from '../core/click-outside.directive';

@Component({
  selector: 'j-overlay-panel',
  imports: [JClickOutsideDirective],
  template: `
    @if (visible) {
      <div [class]="panelClasses" jClickOutside (jClickOutside)="hide()" role="dialog">
        <ng-content></ng-content>
      </div>
    }
  `,
  styles: [
    `
      .j-overlay-panel {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        box-shadow: var(--j-shadow-lg);
        color: var(--j-color-text);
        min-width: 12rem;
        padding: var(--j-spacing-md);
        position: absolute;
        z-index: var(--j-z-index-popover);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JOverlayPanelComponent {
  @Input({ transform: booleanAttribute }) visible = false;
  @Input() styleClass = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() shown = new EventEmitter<void>();
  @Output() hidden = new EventEmitter<void>();

  get panelClasses(): string {
    return ['j-overlay-panel', this.styleClass].filter(Boolean).join(' ');
  }

  show(): void {
    this.visible = true;
    this.visibleChange.emit(true);
    this.shown.emit();
  }

  hide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.hidden.emit();
  }

  toggle(): void {
    this.visible ? this.hide() : this.show();
  }
}
