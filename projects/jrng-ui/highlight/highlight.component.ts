import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface JHighlightTextSegment {
  readonly text: string;
  readonly match: boolean;
}

export function jHighlightText(
  text: string,
  terms: readonly string[],
  caseSensitive = false,
  diacriticInsensitive = true,
): JHighlightTextSegment[] {
  const cleanTerms = terms.map((term) => term.trim()).filter(Boolean);
  if (!text || !cleanTerms.length) return [{ text, match: false }];
  const normalized = normalize(text, caseSensitive, diacriticInsensitive);
  const ranges: [number, number][] = [];
  for (const term of cleanTerms) {
    const needle = normalize(term, caseSensitive, diacriticInsensitive);
    let index = 0;
    while (needle && (index = normalized.indexOf(needle, index)) >= 0) {
      ranges.push([index, index + needle.length]);
      index += Math.max(needle.length, 1);
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const range of ranges) {
    const last = merged.at(-1);
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }
  const result: JHighlightTextSegment[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) result.push({ text: text.slice(cursor, start), match: false });
    result.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < text.length) result.push({ text: text.slice(cursor), match: false });
  return result;
}

@Component({
  selector: 'j-highlight',
  template: `@for (segment of segments(); track $index) {
    @if (segment.match) {
      <mark [class]="markClass()">{{ segment.text }}</mark>
    } @else {
      {{ segment.text }}
    }
  }`,
  styles: [
    `
      :host {
        display: inline;
      }
      mark {
        background: var(--j-highlight-background, #fde68a);
        color: inherit;
        border-radius: var(--j-radius-xs);
        padding-inline: 0.08em;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JHighlightComponent {
  readonly text = input('');
  readonly term = input<string | readonly string[]>('');
  readonly caseSensitive = input(false);
  readonly diacriticInsensitive = input(true);
  readonly markClass = input('j-highlight__mark');
  readonly segments = computed(() =>
    jHighlightText(
      this.text(),
      Array.isArray(this.term()) ? (this.term() as readonly string[]) : [this.term() as string],
      this.caseSensitive(),
      this.diacriticInsensitive(),
    ),
  );
}

function normalize(value: string, caseSensitive: boolean, stripDiacritics: boolean): string {
  let result = stripDiacritics ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : value;
  if (!caseSensitive) result = result.toLocaleLowerCase();
  return result;
}
