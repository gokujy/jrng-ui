import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
  inject,
} from '@angular/core';
import { JMenuComponent, JMenuItem } from '../menu/menu.component';

@Component({
  selector: 'j-context-menu',
  imports: [JMenuComponent],
  template: `
    <j-menu
      #menu
      [model]="model"
      [ariaLabel]="ariaLabel"
      popup
      [(visible)]="visible"
      data-jc-name="context-menu"
      data-jc-section="root"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JContextMenuComponent {
  private readonly documentRef = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private removeTargetListener: (() => void) | null = null;

  @ViewChild('menu') private menu?: JMenuComponent;

  @Input() model: readonly JMenuItem[] = [];
  @Input() ariaLabel = 'Context menu';
  visible = false;

  @Input()
  set target(value: HTMLElement | ElementRef<HTMLElement> | null | undefined) {
    this.removeTargetListener?.();
    this.removeTargetListener = null;

    if (!this.isBrowser || !value) {
      return;
    }

    const element = value instanceof ElementRef ? value.nativeElement : value;
    this.removeTargetListener = this.renderer.listen(element, 'contextmenu', (event: MouseEvent) => {
      event.preventDefault();
      this.show(event);
    });
  }

  constructor() {
    this.destroyRef.onDestroy(() => this.removeTargetListener?.());

    if (!this.isBrowser) {
      return;
    }

    const removeKeydown = this.renderer.listen(this.documentRef, 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
        const target = this.documentRef.activeElement;
        if (target instanceof HTMLElement) {
          event.preventDefault();
          this.show(target);
        }
      }
    });

    this.destroyRef.onDestroy(removeKeydown);
  }

  show(eventOrTarget: MouseEvent | HTMLElement): void {
    this.visible = true;
    this.menu?.show(eventOrTarget);
  }

  hide(): void {
    this.visible = false;
    this.menu?.hide();
  }
}
