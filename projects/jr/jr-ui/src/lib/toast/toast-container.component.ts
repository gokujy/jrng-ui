import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { JrToastPosition, JrToastService } from './toast.service';

@Component({
  selector: 'jr-toast-container',
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JrToastContainerComponent {
  @Input() position: JrToastPosition = 'top-right';

  readonly toastService = inject(JrToastService);
}
