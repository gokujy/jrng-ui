export function jAriaDescribedBy(...ids: readonly (string | null | undefined | false)[]): string | null {
  const describedBy = ids.filter(Boolean).join(' ');
  return describedBy || null;
}

export function jAriaInvalid(isInvalid: boolean): 'true' | null {
  return isInvalid ? 'true' : null;
}
