import { TemplateRef } from '@angular/core';
import { JSeverity } from './types';

/** Shared contract for configurable icon actions in JRNG toolbars, menus and overlays. */
export interface JIconAction<TContext = unknown> {
  readonly id: string;
  readonly icon: string;
  readonly label: string;
  readonly tooltip?: string;
  readonly visible?: boolean | ((context: TContext) => boolean);
  readonly disabled?: boolean | ((context: TContext) => boolean);
  readonly loading?: boolean;
  readonly severity?: JSeverity;
  readonly order?: number;
  readonly command?: (context: TContext, event: Event) => void | Promise<void>;
  readonly permitted?: (context: TContext) => boolean;
  readonly template?: TemplateRef<{ $implicit: TContext; action: JIconAction<TContext> }>;
}

export function jVisibleIconActions<TContext>(
  actions: readonly JIconAction<TContext>[],
  context: TContext,
): readonly JIconAction<TContext>[] {
  return actions
    .filter((action) => action.permitted?.(context) !== false)
    .filter((action) =>
      typeof action.visible === 'function' ? action.visible(context) : action.visible !== false,
    )
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
}

export function jIconActionDisabled<TContext>(
  action: JIconAction<TContext>,
  context: TContext,
): boolean {
  return (
    action.loading === true ||
    (typeof action.disabled === 'function' ? action.disabled(context) : action.disabled === true)
  );
}
