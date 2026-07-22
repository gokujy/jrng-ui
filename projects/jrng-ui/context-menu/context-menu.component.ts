import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
  effect,
  inject,
  input,
} from '@angular/core';
import { JMenuComponent, JMenuItem } from 'jrng-ui/menu';

@Component({
  selector: 'j-context-menu',
  imports: [JMenuComponent],
  template: `
    <j-menu
      #menu
      [model]="model()"
      [ariaLabel]="ariaLabel()"
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

  readonly model = input<readonly JMenuItem[]>([]);
  readonly ariaLabel = input('Context menu');
  readonly target = input<HTMLElement | ElementRef<HTMLElement> | null | undefined>(null);
  visible = false;

  constructor() {
    this.destroyRef.onDestroy(() => this.removeTargetListener?.());

    effect(() => {
      const value = this.target();
      this.removeTargetListener?.();
      this.removeTargetListener = null;

      if (!this.isBrowser || !value) {
        return;
      }

      const element = value instanceof ElementRef ? value.nativeElement : value;
      this.removeTargetListener = this.renderer.listen(
        element,
        'contextmenu',
        (event: MouseEvent) => {
          event.preventDefault();
          this.show(event);
        },
      );
    });

    if (!this.isBrowser) {
      return;
    }

    const removeKeydown = this.renderer.listen(
      this.documentRef,
      'keydown',
      (event: KeyboardEvent) => {
        if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
          const target = this.documentRef.activeElement;
          const HTMLElementCtor = this.documentRef.defaultView?.HTMLElement;
          if (HTMLElementCtor && target instanceof HTMLElementCtor) {
            event.preventDefault();
            this.show(target);
          }
        }
      },
    );

    this.destroyRef.onDestroy(removeKeydown);
  }

  show(eventOrTarget: MouseEvent | HTMLElement): void {
    const MouseEventCtor = this.documentRef.defaultView?.MouseEvent;
    if (MouseEventCtor && eventOrTarget instanceof MouseEventCtor) {
      eventOrTarget.preventDefault();
    }
    this.visible = true;
    this.menu?.show(eventOrTarget);
  }

  hide(): void {
    this.visible = false;
    this.menu?.hide();
  }
}
