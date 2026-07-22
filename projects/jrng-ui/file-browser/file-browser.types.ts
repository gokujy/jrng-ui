import { JFileCategory } from 'jrng-ui/file-preview';

export type JFileBrowserViewMode = 'list' | 'grid';
export type JFileBrowserSelectionMode = 'none' | 'single' | 'multiple';
export type JFileBrowserVariant = 'default' | 'compact' | 'picker' | 'gallery';
export type JFileBrowserSortField = 'name' | 'size' | 'modifiedAt' | 'type';
export type JFileBrowserSortDirection = 'asc' | 'desc';

export interface JFileBrowserItem<T = unknown> {
  readonly id: string;
  readonly name: string;
  readonly kind: 'file' | 'folder';
  readonly mimeType?: string;
  readonly size?: number;
  readonly modifiedAt?: Date | string | number;
  readonly url?: string;
  readonly thumbnailUrl?: string;
  readonly icon?: string;
  readonly disabled?: boolean;
  readonly description?: string;
  readonly metadata?: T;
}

export interface JFileBrowserBreadcrumb<T = unknown> {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean;
  readonly metadata?: T;
}

export interface JFileBrowserAction {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly disabled?: boolean;
  readonly selection?: 'none' | 'single' | 'multiple' | 'any';
}

export interface JFileBrowserItemEvent<T = unknown> {
  readonly item: JFileBrowserItem<T>;
  readonly index: number;
  readonly originalEvent: Event;
}

export interface JFileBrowserActionEvent<T = unknown> {
  readonly action: JFileBrowserAction;
  readonly items: readonly JFileBrowserItem<T>[];
  readonly originalEvent: Event;
}

export interface JFileBrowserSort {
  readonly field: JFileBrowserSortField;
  readonly direction: JFileBrowserSortDirection;
}

export interface JFileBrowserResolvedItem<T = unknown> extends JFileBrowserItem<T> {
  readonly category: JFileCategory;
  readonly typeLabel: string;
  readonly resolvedIcon: string;
}
