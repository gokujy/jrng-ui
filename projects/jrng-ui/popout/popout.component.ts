import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { JPortal, JPortalOutletDirective, JPortalRef, JPortalService } from 'jrng-ui/portal';

@Component({
  selector: 'j-popout',
  imports: [JPortalOutletDirective],
  template: `
    <section
      class="j-popout__surface"
      [class.j-popout__surface--inline]="inline()"
      [attr.aria-label]="ariaLabel()"
      role="region"
    >
      <ng-content />
      <ng-container jPortalOutlet #outlet="jPortalOutlet" />
    </section>
  `,
  styleUrl: './popout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'j-popout',
    '[class.j-popout--inline]': 'inline()',
    '[attr.hidden]': 'inline() ? null : ""',
    'data-jc-name': 'popout',
    'data-jc-section': 'root',
    'data-jc-extend': 'surface',
  },
})
export class JPopoutComponent {
  private readonly portalService = inject(JPortalService);
  private readonly outlet = viewChild.required<JPortalOutletDirective>('outlet');
  readonly inline = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('Popout content');

  attach(portal: JPortal): JPortalRef | null {
    return this.portalService.attach(this.outlet(), portal);
  }

  replace(portal: JPortal): JPortalRef | null {
    return this.portalService.replace(this.outlet(), portal);
  }

  detach(): void {
    this.portalService.detach(this.outlet());
  }
}
