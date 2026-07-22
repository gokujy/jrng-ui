import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

export interface JDownloadResult {
  readonly status: 'success' | 'unavailable' | 'failed';
  readonly filename: string;
  readonly error?: unknown;
}

@Injectable({ providedIn: 'root' })
export class JDownloadService {
  private readonly documentRef = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  downloadBlob(blob: Blob, filename: string): JDownloadResult {
    const safeName = safeFilename(filename) || 'download';
    const view = this.documentRef.defaultView;
    if (!this.browser || !view?.URL?.createObjectURL)
      return { status: 'unavailable', filename: safeName };
    let url = '';
    try {
      url = view.URL.createObjectURL(blob);
      const anchor = this.documentRef.createElement('a');
      anchor.href = url;
      anchor.download = safeName;
      anchor.rel = 'noopener';
      anchor.click();
      return { status: 'success', filename: safeName };
    } catch (error) {
      return { status: 'failed', filename: safeName, error };
    } finally {
      if (url) view.URL.revokeObjectURL(url);
    }
  }

  downloadText(text: string, filename: string, type = 'text/plain;charset=utf-8'): JDownloadResult {
    return this.downloadBlob(new Blob([text], { type }), filename);
  }

  downloadJson(value: unknown, filename = 'data.json', spacing = 2): JDownloadResult {
    return this.downloadText(
      JSON.stringify(value, null, spacing),
      filename,
      'application/json;charset=utf-8',
    );
  }

  downloadCsv(csv: string, filename = 'data.csv'): JDownloadResult {
    return this.downloadText(`\uFEFF${csv}`, filename, 'text/csv;charset=utf-8');
  }
}

function safeFilename(value: string): string {
  return value
    .trim()
    .split('')
    .map((character) => (character.charCodeAt(0) < 32 ? '-' : character))
    .join('')
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 180);
}
