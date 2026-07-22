import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  inject,
  input,
} from '@angular/core';
import { JToast, JToastPosition, JToastService } from './toast.service';

export interface JToastTemplateContext {
  readonly $implicit: JToast;
  readonly toast: JToast;
  readonly close: () => void;
}

@Component({
  selector: 'j-toast',
  imports: [NgTemplateOutlet],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JToastContainerComponent {
  readonly position = input<JToastPosition>('top-right');
  @ContentChild('jToast', { read: TemplateRef }) toastTemplate?: TemplateRef<JToastTemplateContext>;

  readonly toastService = inject(JToastService);
  private swipeStart = new Map<string, number>();

  visibleToasts(): readonly JToast[] {
    return this.toastService.toasts().filter((toast) => toast.position === this.position());
  }

  templateContext(toast: JToast): JToastTemplateContext {
    return {
      $implicit: toast,
      toast,
      close: () => this.toastService.remove(toast.id),
    };
  }

  startSwipe(toast: JToast, event: PointerEvent): void {
    this.swipeStart.set(toast.id, event.clientX);
  }

  endSwipe(toast: JToast, event: PointerEvent): void {
    const start = this.swipeStart.get(toast.id);
    this.swipeStart.delete(toast.id);
    if (start == null) {
      return;
    }
    if (Math.abs(event.clientX - start) > 88) {
      this.toastService.remove(toast.id);
    }
  }
}
