import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JIconComponent, JIconName } from 'jrng-ui/icon';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JSeverity } from 'jrng-ui/core';
import { JSkeletonComponent } from 'jrng-ui/skeleton';
import { JEmptyComponent } from 'jrng-ui/empty';

export type JPanelVariant = 'bordered' | 'borderless' | 'filled' | 'elevated';

@Component({
  selector: 'j-panel',
  imports: [JButtonComponent, JIconComponent, JBadgeComponent, JSkeletonComponent, JEmptyComponent],
  template: `
    <section
      [class]="'j-panel j-panel--' + variant() + ' j-panel--' + density()"
      [class.is-collapsed]="collapsedState()"
      [attr.aria-busy]="loading()"
    >
      @if (header() || toggleable() || icon() || badge() !== null) {
        <header class="j-panel__header">
          <div class="j-panel__heading">
            @if (icon()) {
              <j-icon [name]="icon()!" aria-hidden="true" />
            }
            <div>
              @if (header()) {
                <h3>{{ header() }}</h3>
              }
              @if (subtitle()) {
                <p>{{ subtitle() }}</p>
              }
            </div>
            @if (badge() !== null) {
              <j-badge [value]="badge()!" [severity]="badgeSeverity()" />
            }
          </div>
          <div class="j-panel__actions">
            <ng-content select="[jPanelActions]"></ng-content>
            @if (toggleable()) {
              <j-button
                variant="text"
                size="sm"
                [icon]="collapsedState() ? 'chevron-down' : 'chevron-up'"
                [ariaLabel]="(collapsedState() ? 'Expand ' : 'Collapse ') + (header() || 'panel')"
                [ariaExpanded]="!collapsedState()"
                [disabled]="disabled()"
                (onClick)="toggle()"
              />
            }
          </div>
        </header>
      }
      <div class="j-panel__body" [hidden]="collapsedState()">
        @if (loading()) {
          <j-skeleton variant="text" [rows]="3" />
        } @else if (error()) {
          <j-empty variant="error" title="Unable to load content" [description]="error()" compact />
        } @else if (empty()) {
          <j-empty title="No content" [description]="emptyMessage()" compact />
        } @else {
          <ng-content></ng-content>
        }
      </div>
      @if (!collapsedState()) {
        <ng-content select="[jPanelFooter]"></ng-content>
      }
    </section>
  `,
  styles: [
    `
      .j-panel {
        background: var(--j-color-surface, #fff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-md, 0.5rem);
        color: var(--j-color-text, #111827);
        overflow: hidden;
      }
      .j-panel--borderless {
        border: 0;
      }
      .j-panel--filled {
        background: var(--j-color-surface-muted, #f8fafc);
      }
      .j-panel--elevated {
        border-color: transparent;
        box-shadow: var(--j-shadow-md);
      }
      .j-panel__header {
        align-items: center;
        background: var(--j-color-surface-muted, #f8fafc);
        border-bottom: 1px solid var(--j-color-border, #dbe2ea);
        display: flex;
        justify-content: space-between;
        min-height: 3rem;
        padding: var(--j-spacing-sm, 0.5rem) var(--j-spacing-lg, 1rem);
      }
      .j-panel__heading,
      .j-panel__actions {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-sm, 0.5rem);
        min-width: 0;
      }
      .j-panel__heading h3 {
        font-size: var(--j-font-size-md, 1rem);
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .j-panel__heading p {
        color: var(--j-color-text-muted, #64748b);
        font-size: var(--j-font-size-sm, 0.875rem);
        margin: 0.125rem 0 0;
      }
      .j-panel__body {
        padding: var(--j-spacing-lg, 1rem);
      }
      .j-panel--compact .j-panel__header,
      .j-panel--compact .j-panel__body {
        padding: var(--j-spacing-sm, 0.5rem);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JPanelComponent {
  readonly header = input('');
  readonly subtitle = input('');
  readonly toggleable = input(false, { transform: booleanAttribute });
  readonly collapsed = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly empty = input(false, { transform: booleanAttribute });
  readonly emptyMessage = input('There is nothing to display.');
  readonly error = input('');
  readonly variant = input<JPanelVariant>('bordered');
  readonly density = input<'compact' | 'normal'>('normal');
  readonly icon = input<JIconName | null>(null);
  readonly badge = input<string | number | null>(null);
  readonly badgeSeverity = input<JSeverity>('primary');
  readonly collapsedChange = output<boolean>();
  protected readonly collapsedState = linkedSignal(() => this.collapsed());

  toggle(): void {
    if (!this.toggleable() || this.disabled()) return;
    this.collapsedState.set(!this.collapsedState());
    this.collapsedChange.emit(this.collapsedState());
  }
}
