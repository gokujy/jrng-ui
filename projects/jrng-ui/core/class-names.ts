export type JClassValue =
  | string
  | readonly string[]
  | Readonly<Record<string, boolean | null | undefined>>
  | null
  | undefined
  | false;

export function jMergeClasses(...values: readonly JClassValue[]): string {
  const classes: string[] = [];

  for (const value of values) {
    if (!value) {
      continue;
    }

    if (typeof value === 'string') {
      classes.push(...value.split(/\s+/).filter(Boolean));
      continue;
    }

    if (Array.isArray(value)) {
      classes.push(...value.filter(Boolean));
      continue;
    }

    for (const [className, enabled] of Object.entries(value)) {
      if (enabled) {
        classes.push(className);
      }
    }
  }

  return [...new Set(classes)].join(' ');
}
