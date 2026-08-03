const ALLOWED_ELEMENTS = new Set([
  'A',
  'B',
  'BLOCKQUOTE',
  'BR',
  'CODE',
  'DIV',
  'EM',
  'FONT',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HR',
  'I',
  'IMG',
  'LI',
  'OL',
  'P',
  'PRE',
  'S',
  'SOURCE',
  'SPAN',
  'STRONG',
  'SUB',
  'SUP',
  'TABLE',
  'TBODY',
  'TD',
  'TH',
  'THEAD',
  'TR',
  'U',
  'UL',
  'VIDEO',
]);
const DROP_CONTENT = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH']);
const GLOBAL_ATTRIBUTES = new Set(['title', 'style']);
const ELEMENT_ATTRIBUTES: Readonly<Record<string, ReadonlySet<string>>> = {
  A: new Set(['href', 'target', 'rel']),
  FONT: new Set(['color', 'face', 'size']),
  IMG: new Set(['src', 'alt', 'width', 'height', 'data-j-align']),
  SOURCE: new Set(['src', 'type']),
  TD: new Set(['colspan', 'rowspan']),
  TH: new Set(['colspan', 'rowspan', 'scope']),
  VIDEO: new Set(['src', 'controls', 'poster', 'width', 'height']),
};

export interface JEditorSanitizerAdapter {
  sanitize(html: string, documentRef: Document): string;
}

export interface JEditorImageAdapter {
  selectAndUpload(): Promise<{ readonly url: string; readonly alt?: string } | null>;
}

export function jSanitizeEditorHtml(html: string, documentRef: Document): string {
  const template = documentRef.createElement('template');
  template.innerHTML = html;
  sanitizeChildren(template.content, documentRef);
  return template.innerHTML;
}

export function jIsSafeEditorUrl(value: string, documentRef: Document): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^data:image\/(?:png|jpeg|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(trimmed)) return true;
  if (/^(#|\/|\.\/|\.\.\/)/.test(trimmed)) return true;
  try {
    const url = new URL(trimmed, documentRef.baseURI);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function sanitizeChildren(parent: ParentNode, documentRef: Document): void {
  for (const child of [...parent.childNodes]) {
    if (child.nodeType !== 1) continue;
    const element = child as Element;
    if (DROP_CONTENT.has(element.tagName)) {
      child.remove();
      continue;
    }
    if (!ALLOWED_ELEMENTS.has(element.tagName)) {
      sanitizeChildren(element, documentRef);
      element.replaceWith(...element.childNodes);
      continue;
    }
    sanitizeAttributes(element, documentRef);
    sanitizeChildren(element, documentRef);
  }
}

function sanitizeAttributes(element: Element, documentRef: Document): void {
  const allowed = ELEMENT_ATTRIBUTES[element.tagName] ?? new Set<string>();
  for (const attribute of [...element.attributes]) {
    const name = attribute.name.toLowerCase();
    if (!GLOBAL_ATTRIBUTES.has(name) && !allowed.has(name)) {
      element.removeAttribute(attribute.name);
      continue;
    }
    if ((name === 'href' || name === 'src') && !jIsSafeEditorUrl(attribute.value, documentRef)) {
      element.removeAttribute(attribute.name);
      continue;
    }
    if (name === 'style') {
      const style = sanitizeInlineStyle(attribute.value);
      if (style) element.setAttribute('style', style);
      else element.removeAttribute('style');
    }
  }
  if (element.tagName === 'A' && element.getAttribute('target') === '_blank') {
    element.setAttribute('rel', 'noopener noreferrer');
  }
}

function sanitizeInlineStyle(value: string): string {
  const safe: string[] = [];
  for (const declaration of value.split(';')) {
    const separator = declaration.indexOf(':');
    if (separator < 0) continue;
    const property = declaration.slice(0, separator).trim().toLowerCase();
    const candidate = declaration.slice(separator + 1).trim();
    if (!candidate || /url\s*\(|expression|javascript:/i.test(candidate)) continue;
    if (property === 'line-height' && /^(?:\d+(?:\.\d+)?|normal)$/.test(candidate)) {
      safe.push(`${property}: ${candidate}`);
    } else if (
      ['color', 'background-color'].includes(property) &&
      /^(?:#[\da-f]{3,8}|rgba?\([\d\s,.%]+\)|hsla?\([\d\s,.%]+\)|transparent|currentcolor)$/i.test(
        candidate,
      )
    ) {
      safe.push(`${property}: ${candidate}`);
    } else if (property === 'font-family' && /^[\w\s,'"-]+$/.test(candidate)) {
      safe.push(`${property}: ${candidate}`);
    } else if (property === 'font-size' && /^\d+(?:\.\d+)?(?:px|pt|rem|em|%)$/.test(candidate)) {
      safe.push(`${property}: ${candidate}`);
    } else if (
      property === 'width' &&
      /^(?:auto|(?:100|\d{1,2})(?:\.\d+)?%|\d+(?:\.\d+)?px)$/.test(candidate)
    ) {
      safe.push(`${property}: ${candidate}`);
    } else if (
      property === 'text-align' &&
      /^(?:start|end|left|right|center|justify)$/.test(candidate)
    ) {
      safe.push(`${property}: ${candidate}`);
    }
  }
  return safe.join('; ');
}
