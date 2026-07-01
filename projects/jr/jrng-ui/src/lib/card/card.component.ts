import { CommonModule } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type JrCardVariant = 'default' | 'elevated' | 'bordered' | 'soft';

@Component({
  selector: 'jr-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JrCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() variant: JrCardVariant = 'default';
  @Input({ transform: booleanAttribute }) clickable = false;
}
