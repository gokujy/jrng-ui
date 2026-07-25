import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { JClipboardService } from 'jrng-ui/core';
import { jSanitizeEditorHtml } from 'jrng-ui/editor';
import { JButtonComponent } from 'jrng-ui/button';

export type JHtmlPreviewMode = 'iframe' | 'inline';
export type JHtmlPreviewDevice = 'desktop' | 'tablet' | 'mobile' | 'custom';
export interface JHtmlPreviewExportAdapter {
  export(element: HTMLElement, format?: string): Promise<unknown> | unknown;
}

@Component({
  selector: 'j-html-preview',
  imports: [JButtonComponent],
  template: ` <section
    class="j-html-preview"
    data-jc-name="html-preview"
    [attr.data-j-device]="device()"
  >
    <div class="j-html-preview__toolbar" role="toolbar" aria-label="Preview controls">
      <j-button label="Refresh" icon="undo" variant="outlined" (onClick)="refresh()" />
      <j-button
        [label]="source() ? 'Preview' : 'Source'"
        [icon]="source() ? 'eye' : 'code-xml'"
        variant="outlined"
        (onClick)="source.set(!source())"
      />
      <j-button label="Copy HTML" icon="copy" variant="outlined" (onClick)="copy()" />
      <j-button label="Open" icon="eye" variant="outlined" (onClick)="openPreview()" />
      <j-button label="Print" variant="outlined" (onClick)="printPreview()" />
      @if (exportAdapter()) {
        <j-button label="Export" icon="download" (onClick)="exportPreview()" />
      }
    </div>
    @if (loading()) {
      <div class="j-html-preview__state" role="status">{{ loadingMessage() }}</div>
    } @else if (error()) {
      <div class="j-html-preview__state" role="alert">{{ error() }}</div>
    } @else if (!html()) {
      <div class="j-html-preview__state">{{ emptyMessage() }}</div>
    } @else if (source()) {
      <pre class="j-html-preview__source" tabindex="0">{{ html() }}</pre>
    } @else {
      <div
        #surface
        class="j-html-preview__surface"
        [style.width.px]="previewWidth()"
        [style.height.px]="height()"
        [style.transform]="'scale(' + zoom() + ')'"
      >
        @if (mode() === 'iframe') {
          <iframe
            title="HTML preview"
            sandbox=""
            referrerpolicy="no-referrer"
            [attr.srcdoc]="safeHtml()"
          ></iframe>
        } @else {
          <div class="j-html-preview__inline" [innerHTML]="safeHtml()"></div>
        }
      </div>
    }
  </section>`,
  styles: [
    `
      .j-html-preview {
        display: grid;
        gap: var(--j-spacing-3);
        overflow: auto;
      }
      .j-html-preview__toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2);
      }
      .j-html-preview__surface {
        background: white;
        border: 1px solid var(--j-color-border);
        max-width: 100%;
        overflow: auto;
        transform-origin: top left;
      }
      iframe {
        border: 0;
        height: 100%;
        width: 100%;
      }
      .j-html-preview__inline {
        padding: var(--j-spacing-4);
      }
      .j-html-preview__state {
        padding: var(--j-spacing-8);
        text-align: center;
        color: var(--j-color-muted-foreground);
      }
      .j-html-preview__source {
        background: var(--j-color-muted);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: var(--j-color-foreground);
        margin: 0;
        overflow: auto;
        padding: var(--j-spacing-4);
        white-space: pre-wrap;
      }
      @media (max-width: 48rem) {
        .j-html-preview__surface {
          width: 100% !important;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JHtmlPreviewComponent {
  private readonly documentRef = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly clipboard = inject(JClipboardService);
  readonly html = input('');
  readonly mode = input<JHtmlPreviewMode>('iframe');
  readonly device = input<JHtmlPreviewDevice>('desktop');
  readonly width = input(0);
  readonly height = input(600);
  readonly zoom = input(1);
  readonly loading = input(false);
  readonly error = input('');
  readonly loadingMessage = input('Loading preview...');
  readonly emptyMessage = input('Nothing to preview.');
  readonly exportAdapter = input<JHtmlPreviewExportAdapter | null>(null);
  readonly allowRemoteContent = input(false);
  readonly sanitizer = input<((html: string) => string) | null>(null);
  readonly openWindow = output<void>();
  readonly print = output<void>();
  readonly refreshed = output<void>();
  readonly exported = output<unknown>();
  readonly source = signal(false);
  readonly refreshKey = signal(0);
  readonly surface = viewChild<ElementRef<HTMLElement>>('surface');
  readonly safeHtml = computed(() => {
    this.refreshKey();
    const adapted = this.sanitizer()?.(this.html()) ?? this.html();
    const sanitized = jSanitizeEditorHtml(adapted, this.documentRef);
    return this.allowRemoteContent() ? sanitized : removeRemoteSources(sanitized, this.documentRef);
  });
  readonly previewWidth = computed(
    () => this.width() || { desktop: 1200, tablet: 768, mobile: 375, custom: 800 }[this.device()],
  );
  refresh(): void {
    this.refreshKey.update((v) => v + 1);
    this.refreshed.emit();
  }
  copy(): void {
    void this.clipboard.copyText(this.html());
  }
  openPreview(): void {
    if (!this.browser) return;
    const blob = new Blob([this.safeHtml()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const opened = this.documentRef.defaultView?.open(url, '_blank', 'noopener,noreferrer');
    if (opened) {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      URL.revokeObjectURL(url);
    }
    this.openWindow.emit();
  }
  printPreview(): void {
    if (!this.browser) return;
    const frame = this.surface()?.nativeElement.querySelector('iframe');
    if (frame?.contentWindow) {
      frame.contentWindow.print();
    } else {
      this.documentRef.defaultView?.print();
    }
    this.print.emit();
  }
  async exportPreview(): Promise<void> {
    if (!this.browser) return;
    const surface = this.surface()?.nativeElement;
    if (!surface) return;
    const result = await this.exportAdapter()?.export(surface);
    this.exported.emit(result);
  }
}

function removeRemoteSources(html: string, documentRef: Document): string {
  const template = documentRef.createElement('template');
  template.innerHTML = html;
  for (const element of template.content.querySelectorAll('[src]')) {
    if (/^https?:/i.test(element.getAttribute('src') ?? '')) element.removeAttribute('src');
  }
  return template.innerHTML;
}
