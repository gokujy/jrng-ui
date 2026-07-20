import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

export interface JPrintOptions {
  readonly title?: string;
  readonly styles?: string;
  readonly beforePrint?: () => void;
  readonly afterPrint?: () => void;
}

@Injectable({ providedIn: 'root' })
export class JPrintService {
  private readonly documentRef = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  printElement(element: HTMLElement, options: JPrintOptions = {}): boolean {
    return this.printHtml(element.outerHTML, options);
  }

  printHtml(html: string, options: JPrintOptions = {}): boolean {
    const view = this.documentRef.defaultView;
    if (!this.browser || !view?.open) return false;
    const popup = view.open('', '_blank', 'noopener,noreferrer');
    if (!popup) return false;
    options.beforePrint?.();
    popup.document.open();
    popup.document.write(
      `<!doctype html><html><head><title>${escapeText(options.title ?? '')}</title><style>${options.styles ?? ''}</style></head><body>${sanitizePrintableHtml(html, this.documentRef)}</body></html>`,
    );
    popup.document.close();
    popup.addEventListener('afterprint', () => options.afterPrint?.(), { once: true });
    popup.print();
    return true;
  }
}

function sanitizePrintableHtml(value: string, documentRef: Document): string {
  const template = documentRef.createElement('template');
  template.innerHTML = value;
  for (const element of template.content.querySelectorAll('script,iframe,object,embed'))
    element.remove();
  for (const element of template.content.querySelectorAll('*')) {
    for (const attribute of [...element.attributes]) {
      if (attribute.name.toLowerCase().startsWith('on')) element.removeAttribute(attribute.name);
      if (attribute.name.toLowerCase() === 'src' && /^https?:/i.test(attribute.value)) {
        element.removeAttribute(attribute.name);
      }
    }
  }
  return template.innerHTML;
}

function escapeText(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
