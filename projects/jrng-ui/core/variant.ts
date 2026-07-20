type JVariantClassValue = string | false | null | undefined;
export type JCssCustomProperties = Readonly<
  Record<`--j-${string}`, string | number | null | undefined>
>;

/** Resolves predictable BEM modifier classes without adding empty class tokens. */
export function jResolveVariantClasses(
  block: `j-${string}`,
  values: Readonly<Record<string, string | number | boolean | null | undefined>>,
  additional: readonly JVariantClassValue[] = [],
): string[] {
  const modifiers = Object.entries(values).flatMap(([name, value]) => {
    if (value == null || value === false || value === '') return [];
    return [value === true ? `${block}--${name}` : `${block}--${name}-${String(value)}`];
  });
  return [block, ...modifiers, ...additional.filter((value): value is string => !!value)];
}

/** Converts a semantic property map to values safe for Angular style bindings. */
export function jResolveCssCustomProperties(
  properties: JCssCustomProperties,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(properties)
      .filter((entry): entry is [string, string | number] => entry[1] != null)
      .map(([name, value]) => [name, String(value)]),
  );
}
