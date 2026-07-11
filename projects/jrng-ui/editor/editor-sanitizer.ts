const ALLOWED_ELEMENTS = new Set([
  'A',
  'B',
  'BLOCKQUOTE',
  'BR',
  'CODE',
  'EM',
  'H1',
  'H2',
  'H3',
  'HR',
  'I',
  'IMG',
  'LI',
  'OL',
  'P',
  'PRE',
  'S',
  'STRONG',
  'U',
  'UL',
]);
const DROP_CONTENT = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH']);
const GLOBAL_ATTRIBUTES = new Set(['title']);
const ELEMENT_ATTRIBUTES: Readonly<Record<string, ReadonlySet<string>>> = {
  A: new Set(['href', 'target', 'rel']),
  IMG: new Set(['src', 'alt', 'width', 'height']),
};

export function jSanitizeEditorHtml(html: string, documentRef: Document): string {
  const template = documentRef.createElement('template');
  template.innerHTML = html;
  sanitizeChildren(template.content, documentRef);
  return template.innerHTML;
}

export function jIsSafeEditorUrl(value: string, documentRef: Document): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^(#|\/|\.\/|\.\.\/)/.test(trimmed)) return true;
  try {
    const url = new URL(trimmed, documentRef.baseURI);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function sanitizeChildren(parent: ParentNode, documentRef: Document): void {
  const ElementCtor = documentRef.defaultView?.Element;
  if (!ElementCtor) return;
  for (const child of [...parent.childNodes]) {
    if (!(child instanceof ElementCtor)) continue;
    if (DROP_CONTENT.has(child.tagName)) {
      child.remove();
      continue;
    }
    if (!ALLOWED_ELEMENTS.has(child.tagName)) {
      sanitizeChildren(child, documentRef);
      child.replaceWith(...child.childNodes);
      continue;
    }
    sanitizeAttributes(child, documentRef);
    sanitizeChildren(child, documentRef);
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
    }
  }
  if (element.tagName === 'A' && element.getAttribute('target') === '_blank') {
    element.setAttribute('rel', 'noopener noreferrer');
  }
}
