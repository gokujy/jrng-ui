import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Input,
  PLATFORM_ID,
  Renderer2,
  computed,
  inject,
  model,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JrDialogComponent } from 'jrng-ui/dialog';

export interface JCommandPaletteItem {
  readonly id?: string;
  readonly label: string;
  readonly description?: string;
  readonly icon?: string;
  readonly group?: string;
  readonly keywords?: readonly string[];
  readonly disabled?: boolean;
  readonly command?: () => void;
}

@Component({
  selector: 'j-command-palette',
  imports: [FormsModule, JrDialogComponent],
  template: `
    <j-dialog
      [visible]="visible()"
      (visibleChange)="visible.set($event)"
      size="lg"
      position="top"
      [header]="heading"
      [dismissableMask]="true"
      [closeOnEscape]="true"
      data-jc-name="command-palette"
      data-jc-section="dialog"
      (closed)="handleClosed()"
    >
      <section class="j-command-palette" data-jc-name="command-palette" data-jc-section="root">
        <input
          class="j-command-palette__search"
          type="search"
          [placeholder]="placeholder"
          [ngModel]="query()"
          (ngModelChange)="query.set($event)"
          (keydown)="handleSearchKeydown($event)"
          data-j-initial-focus
        />
        <div class="j-command-palette__list" role="listbox">
          @for (group of groupedResults(); track group.label) {
            <section class="j-command-palette__group">
              <h3>{{ group.label }}</h3>
              @for (item of group.items; track item.id || item.label) {
                <button
                  type="button"
                  role="option"
                  [class]="itemClasses(item)"
                  [disabled]="item.disabled"
                  [attr.aria-selected]="activeItem() === item"
                  (mouseenter)="activeItem.set(item)"
                  (click)="run(item)"
                >
                  @if (item.icon) {
                    <span class="j-command-palette__icon" aria-hidden="true">{{ item.icon }}</span>
                  }
                  <span>
                    <strong>{{ item.label }}</strong>
                    @if (item.description) {
                      <small>{{ item.description }}</small>
                    }
                  </span>
                </button>
              }
            </section>
          } @empty {
            <p class="j-command-palette__empty">{{ emptyMessage }}</p>
          }
        </div>
      </section>
    </j-dialog>
  `,
  styles: [
    `
      .j-command-palette {
        display: grid;
        gap: var(--j-spacing-3);
      }

      .j-command-palette__search {
        background: var(--j-color-muted);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: var(--j-color-foreground);
        font: inherit;
        min-height: 2.75rem;
        outline: none;
        padding: 0 var(--j-spacing-3);
        width: 100%;
      }

      .j-command-palette__search:focus {
        border-color: var(--j-color-ring);
        box-shadow: var(--j-focus-ring);
      }

      .j-command-palette__list {
        display: grid;
        gap: var(--j-spacing-3);
        max-height: min(26rem, 60dvh);
        overflow: auto;
      }

      .j-command-palette__group h3 {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        letter-spacing: 0;
        margin: 0 0 var(--j-spacing-2);
      }

      .j-command-palette__item {
        align-items: center;
        background: transparent;
        border: 0;
        border-radius: var(--j-radius-md);
        color: inherit;
        cursor: pointer;
        display: flex;
        gap: var(--j-spacing-3);
        font: inherit;
        padding: var(--j-spacing-3);
        text-align: left;
        width: 100%;
      }

      .j-command-palette__item.is-active,
      .j-command-palette__item:hover {
        background: var(--j-color-muted);
      }

      .j-command-palette__item small,
      .j-command-palette__empty {
        color: var(--j-color-muted-foreground);
      }

      .j-command-palette__item span {
        display: grid;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JCommandPaletteComponent {
  private readonly documentRef = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly visible = model(false);
  readonly query = signal('');
  readonly activeItem = signal<JCommandPaletteItem | null>(null);
  readonly command = output<JCommandPaletteItem>();

  @Input() commands: readonly JCommandPaletteItem[] = [];
  @Input() heading = 'Command palette';
  @Input() placeholder = 'Search commands';
  @Input() emptyMessage = 'No commands found.';
  @Input() shortcut = 'k';

  readonly results = computed(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) {
      return this.commands;
    }
    return this.commands.filter((item) =>
      [item.label, item.description, item.group, ...(item.keywords ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  });

  readonly groupedResults = computed(() => {
    const groups = new Map<string, JCommandPaletteItem[]>();
    for (const item of this.results()) {
      const group = item.group || 'Commands';
      groups.set(group, [...(groups.get(group) ?? []), item]);
    }
    return Array.from(groups, ([label, items]) => ({ label, items }));
  });

  constructor() {
    if (!this.isBrowser) {
      return;
    }
    const remove = this.renderer.listen(this.documentRef, 'keydown', (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === this.shortcut.toLowerCase()
      ) {
        event.preventDefault();
        this.visible.set(!this.visible());
      }
    });
    this.destroyRef.onDestroy(remove);
  }

  handleSearchKeydown(event: KeyboardEvent): void {
    const items = this.results().filter((item) => !item.disabled);
    const current = this.activeItem();
    const index = Math.max(0, current ? items.indexOf(current) : 0);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeItem.set(items[(index + 1) % items.length] ?? null);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeItem.set(items[(index - 1 + items.length) % items.length] ?? null);
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      this.run(this.activeItem() ?? items[0] ?? null);
    }
  }

  run(item: JCommandPaletteItem | null): void {
    if (!item || item.disabled) {
      return;
    }
    item.command?.();
    this.command.emit(item);
    this.visible.set(false);
  }

  handleClosed(): void {
    this.query.set('');
    this.activeItem.set(null);
  }

  itemClasses(item: JCommandPaletteItem): string {
    return ['j-command-palette__item', this.activeItem() === item ? 'is-active' : '']
      .filter(Boolean)
      .join(' ');
  }
}
