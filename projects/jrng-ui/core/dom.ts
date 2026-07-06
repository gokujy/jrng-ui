export function jIsBrowserDocument(documentRef?: Document | null): documentRef is Document {
  return !!documentRef?.defaultView && !!documentRef.body;
}

export function jGetDefaultView(documentRef?: Document | null): Window | null {
  return documentRef?.defaultView ?? null;
}

export function jIsNode(value: EventTarget | null, documentRef?: Document | null): value is Node {
  const NodeCtor = documentRef?.defaultView?.Node;
  return !!NodeCtor && value instanceof NodeCtor;
}
