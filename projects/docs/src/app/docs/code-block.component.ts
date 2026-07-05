import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, computed, inject, input, signal } from '@angular/core';
import { JIconComponent } from 'jrng-ui/icon';

type CodeTokenKind = 'comment' | 'keyword' | 'string' | 'tag' | 'attr' | 'type' | 'plain';

interface CodeToken {
  readonly text: string;
  readonly kind: CodeTokenKind;
}

@Component({
  selector: 'app-code-block',
  imports: [JIconComponent],
  template: `
    <div class="j-doc-code">
      <div class="j-doc-code__header">
        @if (label()) {
          <span>{{ label() }}</span>
        }
        <button type="button" (click)="copy()">
          <j-icon [name]="copied() ? 'check-check' : 'copy'" />
          {{ copied() ? 'Copied' : 'Copy' }}
        </button>
      </div>
      <pre><code>@for (token of highlightedCode(); track $index) {<span [class]="'j-token j-token--' + token.kind">{{ token.text }}</span>}</code></pre>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeBlockComponent {
  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private copyTimer: number | undefined;

  readonly code = input('');
  readonly label = input('');
  readonly copied = signal(false);
  readonly highlightedCode = computed(() => tokenizeCode(this.code()));

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.copyTimer !== undefined) {
        this.documentRef.defaultView?.clearTimeout(this.copyTimer);
      }
    });
  }

  copy(): void {
    if (!this.isBrowser) {
      return;
    }

    const windowRef = this.documentRef.defaultView;
    void windowRef?.navigator.clipboard?.writeText(this.code()).then(() => {
      this.copied.set(true);
      this.copyTimer = windowRef.setTimeout(() => this.copied.set(false), 1200);
    });
  }
}

function tokenizeCode(code: string): readonly CodeToken[] {
  const tokens: CodeToken[] = [];
  const pattern =
    /(<!--[\s\S]*?-->|\/\/[^\n]*|\/\*[\s\S]*?\*\/|`(?:\\.|[^`])*`|'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|<\/?[A-Za-z][\w:-]*|[\[(][\w:-]+[\])]|@[A-Za-z]+|\b(?:import|from|export|const|let|readonly|class|interface|type|return|if|else|true|false|null|undefined|new|extends|implements|public|private|protected)\b|\b[A-Z][A-Za-z0-9_]*\b)/g;
  let index = 0;

  for (const match of code.matchAll(pattern)) {
    const text = match[0];
    const start = match.index ?? 0;

    if (start > index) {
      tokens.push({ text: code.slice(index, start), kind: 'plain' });
    }

    tokens.push({ text, kind: tokenKind(text) });
    index = start + text.length;
  }

  if (index < code.length) {
    tokens.push({ text: code.slice(index), kind: 'plain' });
  }

  return tokens;
}

function tokenKind(text: string): CodeTokenKind {
  if (text.startsWith('//') || text.startsWith('/*') || text.startsWith('<!--')) {
    return 'comment';
  }

  if (text.startsWith('"') || text.startsWith("'") || text.startsWith('`')) {
    return 'string';
  }

  if (text.startsWith('<')) {
    return 'tag';
  }

  if (text.startsWith('[') || text.startsWith('(') || text.startsWith('@')) {
    return 'attr';
  }

  if (/^[A-Z]/.test(text)) {
    return 'type';
  }

  return 'keyword';
}
