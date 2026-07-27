import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-menu-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS],
  template: `
    @let example = previewExample();
    @switch (doc().slug) {
      @case ('action-menu') {
        <div class="j-action-menu-preview">
          <section>
            <span class="j-preview-label">Inline actions</span>
            <j-action-menu [actions]="rowActions" [row]="orders[0]" />
          </section>
          <section>
            <span class="j-preview-label">Compact popup</span>
            <j-action-menu
              popup
              triggerIcon="more-vertical"
              triggerLabel="Open order actions"
              [actions]="rowActions"
              [row]="orders[0]"
            />
          </section>
        </div>
      }
      @case ('breadcrumb') {
        <j-breadcrumb
          [variant]="breadcrumbVariants[example.index]"
          [home]="breadcrumbHome"
          [model]="breadcrumbItems"
        />
      }
      @case ('menu') {
        <j-menu [model]="menuItems" ariaLabel="Project actions" />
      }
      @case ('command-palette') {
        <div class="j-preview-row">
          <j-button label="Open command palette" (onClick)="commandPaletteOpen = true" />
          <j-command-palette
            [commands]="commands"
            [(visible)]="commandPaletteOpen"
            placeholder="Search commands"
          />
        </div>
      }
      @case ('context-menu') {
        <div #contextTarget class="j-context-preview-target" tabindex="0">
          Right-click this area
        </div>
        <j-context-menu [target]="contextTarget" [model]="menubarItems" />
      }
      @case ('mega-menu') {
        <j-mega-menu [model]="megaMenuItems" ariaLabel="Product navigation" />
      }
      @case ('menubar') {
        <j-menubar [model]="menubarItems" ariaLabel="Application menu" />
      }
      @case ('sidebar-nav') {
        <j-sidebar-nav [model]="menuItems" activeKey="Open" />
      }
      @case ('tiered-menu') {
        <j-tiered-menu [model]="menuItems" />
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
}
