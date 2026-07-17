import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { formatFileSize, resolveFileType } from 'jrng-ui/file-preview';
import { JIconComponent } from 'jrng-ui/icon';
import {
  JFileBrowserAction,
  JFileBrowserActionEvent,
  JFileBrowserBreadcrumb,
  JFileBrowserItem,
  JFileBrowserItemEvent,
  JFileBrowserResolvedItem,
  JFileBrowserSelectionMode,
  JFileBrowserSort,
  JFileBrowserSortDirection,
  JFileBrowserSortField,
  JFileBrowserVariant,
  JFileBrowserViewMode,
} from './file-browser.types';

@Component({
  selector: 'j-file-browser',
  imports: [JIconComponent],
  templateUrl: './file-browser.component.html',
  styleUrl: './file-browser.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JFileBrowserComponent<T = unknown> {
  readonly items = input<readonly JFileBrowserItem<T>[]>([]);
  readonly breadcrumbs = input<readonly JFileBrowserBreadcrumb[]>([]);
  readonly selection = input<readonly string[]>([]);
  readonly actions = input<readonly JFileBrowserAction[]>([]);
  readonly viewMode = input<JFileBrowserViewMode>('list');
  readonly variant = input<JFileBrowserVariant>('default');
  readonly selectionMode = input<JFileBrowserSelectionMode>('none');
  readonly selectionLimit = input(0, { transform: numberAttribute });
  readonly sortField = input<JFileBrowserSortField>('name');
  readonly sortDirection = input<JFileBrowserSortDirection>('asc');
  readonly title = input('Files');
  readonly emptyTitle = input('No files or folders');
  readonly emptyDescription = input('Items added here will appear in this browser.');
  readonly loadingLabel = input('Loading files');
  readonly selectedLabel = input('selected');
  readonly createFolderLabel = input('New folder');
  readonly uploadLabel = input('Upload');
  readonly refreshLabel = input('Refresh');
  readonly ariaLabel = input('File browser');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly showToolbar = input(true, { transform: booleanAttribute });
  readonly showCreateFolder = input(true, { transform: booleanAttribute });
  readonly showUpload = input(true, { transform: booleanAttribute });
  readonly showRefresh = input(true, { transform: booleanAttribute });
  readonly showSelection = input(true, { transform: booleanAttribute });

  readonly itemOpen = output<JFileBrowserItemEvent<T>>();
  readonly folderOpen = output<JFileBrowserItemEvent<T>>();
  readonly selectionChange = output<readonly string[]>();
  readonly breadcrumbSelect = output<JFileBrowserBreadcrumb>();
  readonly action = output<JFileBrowserActionEvent<T>>();
  readonly viewModeChange = output<JFileBrowserViewMode>();
  readonly sortChange = output<JFileBrowserSort>();
  readonly createFolder = output<void>();
  readonly upload = output<void>();
  readonly refresh = output<void>();

  readonly resolvedItems = computed<readonly JFileBrowserResolvedItem<T>[]>(() => {
    const direction = this.sortDirection() === 'asc' ? 1 : -1;
    const field = this.sortField();
    return this.items()
      .map((item) => {
        const presentation = resolveFileType(item);
        return {
          ...item,
          category: presentation.category,
          typeLabel: presentation.label,
          resolvedIcon: item.icon || presentation.icon,
        };
      })
      .sort((first, second) => {
        if (first.kind !== second.kind) return first.kind === 'folder' ? -1 : 1;
        return this.compare(first, second, field) * direction;
      });
  });

  readonly selectedItems = computed(() => {
    const selected = new Set(this.selection());
    return this.resolvedItems().filter((item) => selected.has(item.id));
  });

  readonly classes = computed(() =>
    [
      'j-file-browser',
      `j-file-browser--${this.variant()}`,
      `j-file-browser--${this.viewMode()}`,
      this.disabled() ? 'is-disabled' : '',
      this.loading() ? 'is-loading' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  openItem(item: JFileBrowserItem<T>, index: number, originalEvent: Event): void {
    if (this.disabled() || item.disabled) return;
    const event = { item, index, originalEvent };
    this.itemOpen.emit(event);
    if (item.kind === 'folder') this.folderOpen.emit(event);
  }

  toggleSelection(item: JFileBrowserItem<T>, originalEvent: Event): void {
    originalEvent.stopPropagation();
    if (this.disabled() || item.disabled || this.selectionMode() === 'none') return;
    const selected = new Set(this.selection());
    if (selected.has(item.id)) selected.delete(item.id);
    else {
      if (this.selectionMode() === 'single') selected.clear();
      if (this.selectionLimit() > 0 && selected.size >= this.selectionLimit()) return;
      selected.add(item.id);
    }
    this.selectionChange.emit([...selected]);
  }

  handleItemKeydown(event: KeyboardEvent, item: JFileBrowserItem<T>, index: number): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.openItem(item, index, event);
      return;
    }
    if (event.key === ' ' && this.selectionMode() !== 'none') {
      event.preventDefault();
      this.toggleSelection(item, event);
      return;
    }
    const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const container = (event.currentTarget as HTMLElement).parentElement;
    const candidates = Array.from(
      container?.querySelectorAll<HTMLElement>('[data-j-file-item]') ?? [],
    );
    const current = candidates.indexOf(event.currentTarget as HTMLElement);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? candidates.length - 1
          : Math.max(
              0,
              Math.min(
                candidates.length - 1,
                current + (event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1),
              ),
            );
    candidates[next]?.focus();
  }

  emitAction(action: JFileBrowserAction, originalEvent: Event): void {
    if (!this.actionAvailable(action)) return;
    this.action.emit({ action, items: this.selectedItems(), originalEvent });
  }

  actionAvailable(action: JFileBrowserAction): boolean {
    if (this.disabled() || action.disabled) return false;
    const count = this.selectedItems().length;
    return action.selection === 'none'
      ? count === 0
      : action.selection === 'single'
        ? count === 1
        : action.selection === 'multiple'
          ? count > 1
          : action.selection === 'any'
            ? count > 0
            : true;
  }

  isSelected(item: JFileBrowserItem<T>): boolean {
    return this.selection().includes(item.id);
  }
  formatSize(size?: number): string {
    return size == null ? '' : formatFileSize(size);
  }
  formatDate(value?: Date | string | number): string {
    if (value == null) return '';
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime())
      ? ''
      : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
  }

  private compare(
    first: JFileBrowserResolvedItem<T>,
    second: JFileBrowserResolvedItem<T>,
    field: JFileBrowserSortField,
  ): number {
    if (field === 'size') return (first.size ?? -1) - (second.size ?? -1);
    if (field === 'modifiedAt')
      return new Date(first.modifiedAt ?? 0).getTime() - new Date(second.modifiedAt ?? 0).getTime();
    if (field === 'type')
      return first.typeLabel.localeCompare(second.typeLabel, undefined, { sensitivity: 'base' });
    return first.name.localeCompare(second.name, undefined, { numeric: true, sensitivity: 'base' });
  }
}
