import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { JClipboardService, jCreateId } from 'jrng-ui/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JInputComponent } from 'jrng-ui/input';
import { inject } from '@angular/core';
export type JDiffLayout = 'side-by-side' | 'inline';
export type JDiffState = 'added' | 'removed' | 'changed' | 'unchanged';
export interface JDiffRow {
  readonly key: string;
  readonly before: unknown;
  readonly after: unknown;
  readonly state: JDiffState;
}
export function jDiffValues(before: unknown, after: unknown): JDiffRow[] {
  if (isObject(before) || isObject(after)) {
    return flattenObjectDiff(before, after);
  }
  const a = String(before ?? '').split('\n'),
    b = String(after ?? '').split('\n');
  return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => ({
    key: String(i + 1),
    before: a[i],
    after: b[i],
    state:
      a[i] === undefined
        ? 'added'
        : b[i] === undefined
          ? 'removed'
          : a[i] === b[i]
            ? 'unchanged'
            : 'changed',
  }));
}
@Component({
  selector: 'j-diff-viewer',
  imports: [JButtonComponent, JInputComponent],
  host: { style: 'display: block; width: 100%;' },
  template: `<section class="j-diff-viewer" [attr.data-j-layout]="layout()">
    <div class="j-diff-viewer__toolbar" role="toolbar" aria-label="Diff controls">
      <j-input
        type="search"
        label="Search differences"
        placeholder="Filter fields"
        [value]="search()"
        (valueChange)="search.set($event)"
      />
      <j-button size="sm" variant="text" label="Expand all" (onClick)="collapsed.set(false)" />
      <j-button
        size="sm"
        variant="text"
        label="Collapse unchanged"
        (onClick)="collapsed.set(true)"
      />
      <j-button size="sm" variant="text" label="Copy" (onClick)="copy()" />
    </div>
    <div class="j-diff-viewer__legend" [attr.id]="summaryId">
      <span><i class="is-added"></i>{{ summary().added }} added</span>
      <span><i class="is-removed"></i>{{ summary().removed }} removed</span>
      <span><i class="is-changed"></i>{{ summary().changed }} changed</span>
      <span><i class="is-unchanged"></i>{{ summary().unchanged }} unchanged</span>
    </div>
    <div
      class="j-diff-viewer__rows"
      role="table"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-describedby]="summaryId"
    >
      <div class="j-diff-viewer__row j-diff-viewer__header" role="row">
        <span role="columnheader">{{ fieldLabel() }}</span>
        @if (layout() === 'side-by-side') {
          <span role="columnheader">{{ beforeLabel() }}</span>
          <span role="columnheader">{{ afterLabel() }}</span>
        } @else {
          <span role="columnheader">{{ beforeLabel() }} to {{ afterLabel() }}</span>
        }
      </div>
      @for (row of visibleRows(); track row.key) {
        <div
          class="j-diff-viewer__row"
          role="row"
          tabindex="0"
          [attr.data-state]="row.state"
          [attr.aria-label]="row.key + ': ' + row.state"
        >
          <span class="j-diff-viewer__key" role="rowheader"
            >{{ row.key }}<span class="j-hidden-accessible">, {{ row.state }}</span></span
          >
          @if (layout() === 'side-by-side') {
            <pre role="cell">{{ format(row.before, row.key) }}</pre>
            <pre role="cell">{{ format(row.after, row.key) }}</pre>
          } @else {
            <pre role="cell"
              >{{ format(row.before, row.key) }} → {{ format(row.after, row.key) }}</pre>
          }
        </div>
      } @empty {
        <p class="j-diff-viewer__empty" role="status">No differences match this search.</p>
      }
    </div>
  </section>`,
  styles: [
    `
      .j-diff-viewer {
        display: grid;
        gap: var(--j-spacing-3);
      }
      .j-diff-viewer__toolbar {
        align-items: end;
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2);
      }
      .j-diff-viewer__legend {
        align-items: center;
        color: var(--j-color-muted-foreground);
        display: flex;
        flex-wrap: wrap;
        font-size: var(--j-font-size-xs);
        gap: var(--j-spacing-3);
      }
      .j-diff-viewer__legend span {
        align-items: center;
        display: inline-flex;
        gap: var(--j-spacing-1);
      }
      .j-diff-viewer__legend i {
        background: var(--j-color-muted);
        border-radius: var(--j-radius-full);
        display: inline-block;
        height: 0.625rem;
        width: 0.625rem;
      }
      .j-diff-viewer__legend .is-added {
        background: var(--j-color-success);
      }
      .j-diff-viewer__legend .is-removed {
        background: var(--j-color-danger);
      }
      .j-diff-viewer__legend .is-changed {
        background: var(--j-color-warning);
      }
      .j-diff-viewer__rows {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        max-height: var(--j-diff-max-height, 40rem);
        overflow: auto;
      }
      .j-diff-viewer__row {
        display: grid;
        grid-template-columns: minmax(8rem, 0.5fr) 1fr 1fr;
        border-bottom: 1px solid var(--j-color-border);
      }
      .j-diff-viewer__row[data-state='added'] {
        background: var(--j-diff-added-background);
      }
      .j-diff-viewer__row[data-state='removed'] {
        background: var(--j-diff-removed-background);
      }
      .j-diff-viewer__row[data-state='changed'] {
        background: var(--j-diff-changed-background);
      }
      .j-diff-viewer__row[data-state='unchanged'] {
        color: var(--j-color-muted-foreground);
      }
      .j-diff-viewer__header {
        background: var(--j-color-muted);
        font-weight: var(--j-font-weight-semibold);
        position: sticky;
        top: 0;
        z-index: 1;
      }
      .j-diff-viewer__header > span {
        padding: var(--j-spacing-2);
      }
      .j-diff-viewer__row:focus-visible {
        box-shadow: inset var(--j-focus-ring);
        outline: none;
      }
      pre,
      .j-diff-viewer__key {
        margin: 0;
        padding: var(--j-spacing-2);
        overflow-wrap: anywhere;
        white-space: pre-wrap;
      }
      .j-diff-viewer__key {
        font-weight: 600;
      }
      .j-diff-viewer[data-j-layout='inline'] .j-diff-viewer__row {
        grid-template-columns: minmax(8rem, 0.5fr) 2fr;
      }
      .j-diff-viewer__empty {
        color: var(--j-color-muted-foreground);
        margin: 0;
        padding: var(--j-spacing-6);
        text-align: center;
      }
      @media (max-width: 48rem) {
        .j-diff-viewer__row {
          grid-template-columns: 1fr;
        }
        .j-diff-viewer__key {
          position: sticky;
          left: 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDiffViewerComponent {
  private readonly clipboard = inject(JClipboardService);
  readonly summaryId = jCreateId('j-diff-summary');
  readonly before = input<unknown>('');
  readonly after = input<unknown>('');
  readonly layout = input<JDiffLayout>('side-by-side');
  readonly fieldLabel = input('Field');
  readonly beforeLabel = input('Before');
  readonly afterLabel = input('After');
  readonly collapseUnchanged = input(false);
  readonly ariaLabel = input('Value differences');
  readonly formatter = input<((value: unknown, key: string) => string) | null>(null);
  readonly mask = input<((key: string, value: unknown) => unknown) | null>(null);
  readonly copied = output<void>();
  readonly search = signal('');
  readonly collapsed = signal(false);
  readonly rows = computed(() => jDiffValues(this.before(), this.after()));
  readonly summary = computed<Record<JDiffState, number>>(() =>
    this.rows().reduce((counts, row) => ({ ...counts, [row.state]: counts[row.state] + 1 }), {
      added: 0,
      removed: 0,
      changed: 0,
      unchanged: 0,
    }),
  );
  readonly visibleRows = computed(() => {
    const q = this.search().toLocaleLowerCase();
    return this.rows().filter(
      (r) =>
        (!(this.collapsed() || this.collapseUnchanged()) || r.state !== 'unchanged') &&
        (!q || `${r.key} ${r.before} ${r.after}`.toLocaleLowerCase().includes(q)),
    );
  });
  format(v: unknown, k: string): string {
    try {
      const masked = this.mask()?.(k, v) ?? v;
      const formatted =
        this.formatter()?.(masked, k) ??
        (typeof masked === 'string' ? masked : JSON.stringify(masked, null, 2));
      return formatted ?? '';
    } catch {
      return '[Unable to display value]';
    }
  }
  copy() {
    void this.clipboard
      .copyStructured({ before: this.before(), after: this.after() })
      .then(() => this.copied.emit());
  }
}
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function flattenObjectDiff(before: unknown, after: unknown, prefix = ''): JDiffRow[] {
  const left = isObject(before) ? before : {};
  const right = isObject(after) ? after : {};
  return [...new Set([...Object.keys(left), ...Object.keys(right)])].flatMap((key) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const leftValue = left[key];
    const rightValue = right[key];
    if (isObject(leftValue) || isObject(rightValue)) {
      const nested = flattenObjectDiff(leftValue, rightValue, path);
      if (nested.length) return nested;
    }
    const state: JDiffState = !(key in left)
      ? 'added'
      : !(key in right)
        ? 'removed'
        : deepEqual(leftValue, rightValue)
          ? 'unchanged'
          : 'changed';
    return [{ key: path, before: leftValue, after: rightValue, state }];
  });
}
function deepEqual(a: unknown, b: unknown) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}
