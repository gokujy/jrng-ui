import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { JToast, JrToastPosition, JrToastService } from './toast.service';

@Component({
  selector: 'j-toast',
  imports: [],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JrToastContainerComponent {
  @Input() position: JrToastPosition = 'top-right';

  readonly toastService = inject(JrToastService);

  visibleToasts(): readonly JToast[] {
    return this.toastService.toasts().filter((toast) => toast.position === this.position);
  }
}
