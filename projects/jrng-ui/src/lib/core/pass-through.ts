import { jMergeClasses, JClassValue } from './class-names';

export type JPassThroughValue = string | number | boolean | null | undefined;

export type JPassThroughAttributes = Readonly<
  Record<string, JPassThroughValue | readonly JPassThroughValue[] | Record<string, boolean | null | undefined>>
>;

export type JPassThrough = Readonly<Record<string, JPassThroughAttributes | null | undefined>>;

export interface JResolvedPassThrough {
  readonly class: string | null;
  readonly attrs: Readonly<Record<string, string | number | boolean>>;
}

export function jPassThroughFor(pt: JPassThrough | null | undefined, part: string): JPassThroughAttributes {
  return pt?.[part] ?? {};
}

export function jMergePartClasses(
  componentClasses: JClassValue,
  styleClass?: JClassValue,
  pt?: JPassThrough | null,
  part = 'root',
): string {
  return jMergeClasses(componentClasses, styleClass, jPassThroughFor(pt, part)['class'] as JClassValue);
}

export function jMergePartAttrs(
  pt: JPassThrough | null | undefined,
  part: string,
  attrs: Readonly<Record<string, JPassThroughValue>> = {},
): Readonly<Record<string, string | number | boolean>> {
  const passThrough = jPassThroughFor(pt, part);
  const merged: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries({ ...passThrough, ...attrs })) {
    if (key === 'class' || key === 'style' || value == null || value === false) {
      continue;
    }

    if (isAllowedPassThroughAttribute(key) && isSimplePassThroughValue(value)) {
      merged[key] = value;
    }
  }

  return merged;
}

export function jResolvePassThrough(
  pt: JPassThrough | null | undefined,
  part: string,
  componentClasses: JClassValue,
  styleClass?: JClassValue,
  attrs: Readonly<Record<string, JPassThroughValue>> = {},
): JResolvedPassThrough {
  const className = jMergePartClasses(componentClasses, styleClass, pt, part);

  return {
    class: className || null,
    attrs: jMergePartAttrs(pt, part, attrs),
  };
}

function isAllowedPassThroughAttribute(key: string): boolean {
  return key === 'id' || key === 'role' || key === 'title' || key.startsWith('aria-') || key.startsWith('data-');
}

function isSimplePassThroughValue(
  value: JPassThroughValue | readonly JPassThroughValue[] | Record<string, boolean | null | undefined>,
): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}
