import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { JButtonComponent, JButtonSeverity, JButtonSize, JButtonVariant } from 'jrng-ui/button';
import { JMenuComponent, JMenuItem, JMenuItemTemplateContext } from 'jrng-ui/menu';

@Directive({ selector: 'ng-template[jSplitButtonItem]' })
export class JSplitButtonItemDirective {
  readonly templateRef = inject<TemplateRef<JMenuItemTemplateContext>>(TemplateRef);
}

@Component({
  selector: 'j-split-button',
  imports: [JButtonComponent, JMenuComponent, NgTemplateOutlet],
  template: `
    <div class="j-split-button__group" role="group" [attr.aria-label]="groupAriaLabel()">
      <j-button
        #primaryButton
        styleClass="j-split-button__primary"
        [label]="label()"
        [icon]="icon()"
        [severity]="severity()"
        [variant]="variant()"
        [size]="size()"
        [loading]="loading()"
        [disabled]="disabled()"
        (onClick)="activatePrimary($event)"
        (keydown)="onPrimaryKeydown($event)"
      />
      <j-button
        #menuButton
        styleClass="j-split-button__trigger"
        actionDisplay="icon"
        icon="chevron-down"
        [ariaLabel]="menuAriaLabel()"
        ariaHasPopup="menu"
        [ariaExpanded]="menuOpen"
        [severity]="severity()"
        [variant]="variant()"
        [size]="size()"
        [disabled]="disabled() || loading()"
        (onClick)="toggleMenu($event)"
        (keydown)="onTriggerKeydown($event)"
      />
    </div>
    <j-menu
      #menu
      popup
      [model]="model()"
      [target]="triggerElement()"
      [ariaLabel]="menuAriaLabel()"
      (visibleChange)="onMenuVisibility($event)"
      (itemClick)="menuAction.emit($event)"
    >
      @if (itemTemplate()) {
        <ng-template
          #jMenuItem
          let-item
          let-active="active"
          let-disabled="disabled"
          let-level="level"
        >
          <ng-container
            [ngTemplateOutlet]="itemTemplate()!.templateRef"
            [ngTemplateOutletContext]="{
              $implicit: item,
              item,
              active,
              disabled,
              level,
            }"
          />
        </ng-template>
      }
    </j-menu>
  `,
  styleUrl: './split-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'j-split-button',
    '[class.j-split-button--disabled]': 'disabled()',
    '[class.j-split-button--loading]': 'loading()',
    'data-jc-name': 'split-button',
    'data-jc-section': 'root',
    'data-jc-extend': 'primary trigger menu item',
  },
})
export class JSplitButtonComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly label = input('');
  readonly icon = input('');
  readonly severity = input<JButtonSeverity>('primary');
  readonly variant = input<JButtonVariant>('solid');
  readonly size = input<JButtonSize>('md');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly model = input<readonly JMenuItem[]>([]);
  readonly groupAriaLabel = input('Split button');
  readonly menuAriaLabel = input('More actions');

  readonly primaryAction = output<MouseEvent>();
  readonly menuAction = output<{ item: JMenuItem; originalEvent: Event }>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly itemTemplate = contentChild(JSplitButtonItemDirective);
  private readonly primaryButton = viewChild.required<JButtonComponent>('primaryButton');
  private readonly menuButton = viewChild.required<JButtonComponent>('menuButton');
  private readonly menu = viewChild.required<JMenuComponent>('menu');
  menuOpen = false;

  activatePrimary(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) this.primaryAction.emit(event);
  }

  toggleMenu(event?: MouseEvent): void {
    if (this.disabled() || this.loading()) return;
    this.menu().toggle(event);
  }

  openMenu(): void {
    if (this.disabled() || this.loading()) return;
    this.menu().show(this.triggerElement() ?? undefined);
  }

  closeMenu(restoreFocus = true): void {
    if (!this.menuOpen) return;
    this.menu().hide();
    if (restoreFocus) queueMicrotask(() => this.menuButton().focus());
  }

  focus(): void {
    this.primaryButton().focus();
  }

  onPrimaryKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || (event.altKey && event.key === 'ArrowDown')) {
      event.preventDefault();
      this.openMenu();
    }
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openMenu();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeMenu();
    }
  }

  onMenuVisibility(visible: boolean): void {
    const changed = this.menuOpen !== visible;
    this.menuOpen = visible;
    if (!changed) return;
    if (visible) this.opened.emit();
    else {
      this.closed.emit();
      queueMicrotask(() => this.menuButton().focus());
    }
  }

  triggerElement(): HTMLElement | null {
    return this.host.querySelector<HTMLElement>('.j-split-button__trigger');
  }
}
