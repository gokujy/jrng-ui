import { booleanAttribute, ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type JrCardVariant = 'default' | 'elevated' | 'bordered' | 'soft';

@Component({
  selector: 'j-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JrCardComponent {
  @Input() header = '';
  @Input() subheader = '';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() variant: JrCardVariant = 'default';
  @Input() styleClass = '';
  @Input({ transform: booleanAttribute }) clickable = false;

  get resolvedHeader(): string {
    return this.header || this.title;
  }

  get resolvedSubheader(): string {
    return this.subheader || this.subtitle;
  }

  get cardClasses(): string {
    return [
      'j-card',
      `j-card--${this.variant}`,
      this.clickable ? 'j-card--clickable' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }
}
