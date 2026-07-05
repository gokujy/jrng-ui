import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, inject, input, signal } from '@angular/core';
import { JIconComponent } from 'jrng-ui/icon';

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
      <pre><code>{{ code() }}</code></pre>
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
