export type JSelectionPrimitive = string | number | boolean;
export type JSelectionOptionRecord = Readonly<Record<string, unknown>>;
export type JSelectionOptionSource = JSelectionPrimitive | JSelectionOptionRecord;

export interface JNormalizedSelectionOption {
  readonly label: string;
  readonly value: unknown;
  readonly disabled: boolean;
  readonly source: JSelectionOptionSource;
}

export function jNormalizeSelectionOptions(
  options: readonly JSelectionOptionSource[],
  optionLabel = 'label',
  optionValue = 'value',
  optionDisabled = 'disabled',
): readonly JNormalizedSelectionOption[] {
  return options.map((option) => ({
    label: jResolveSelectionLabel(option, optionLabel, optionValue),
    value: jResolveSelectionValue(option, optionLabel, optionValue),
    disabled: jResolveSelectionDisabled(option, optionDisabled),
    source: option,
  }));
}

export function jSameSelectionValue(left: unknown, right: unknown): boolean {
  return Object.is(left, right);
}

function jResolveSelectionLabel(
  option: JSelectionOptionSource,
  optionLabel: string,
  optionValue: string,
): string {
  if (jIsSelectionRecord(option)) {
    return String(
      option[optionLabel] ?? option['label'] ?? option[optionValue] ?? option['value'] ?? '',
    );
  }

  return String(option);
}

function jResolveSelectionValue(
  option: JSelectionOptionSource,
  optionLabel: string,
  optionValue: string,
): unknown {
  if (jIsSelectionRecord(option)) {
    return (
      option[optionValue] ?? option['value'] ?? option[optionLabel] ?? option['label'] ?? option
    );
  }

  return option;
}

function jResolveSelectionDisabled(
  option: JSelectionOptionSource,
  optionDisabled: string,
): boolean {
  return (
    jIsSelectionRecord(option) && (option[optionDisabled] === true || option['disabled'] === true)
  );
}

function jIsSelectionRecord(value: JSelectionOptionSource): value is JSelectionOptionRecord {
  return typeof value === 'object' && value !== null;
}
