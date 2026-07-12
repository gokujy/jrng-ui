export type DocsStatus = 'Stable';

export interface DocsApiRow {
  readonly name: string;
  readonly type: string;
  readonly defaultValue: string;
  readonly description: string;
}

export interface DocsEventRow {
  readonly event: string;
  readonly payload: string;
  readonly description: string;
}

export interface DocsCssVariableRow {
  readonly variable: string;
  readonly fallback: string;
  readonly description: string;
}

export interface ComponentCodeExamples {
  readonly importCode: string;
  readonly basic: string;
  readonly variants?: string;
  readonly sizes?: string;
  readonly states?: string;
  readonly angular?: string;
}

export interface ComponentDoc {
  readonly slug: string;
  readonly name: string;
  readonly category: string;
  readonly icon: string;
  readonly selector: string;
  readonly importPath: string;
  readonly status: DocsStatus;
  readonly description: string;
  readonly whenToUse: string;
  readonly code: ComponentCodeExamples;
  readonly usage: readonly string[];
  readonly variants: readonly string[];
  readonly sizes: readonly string[];
  readonly states: readonly string[];
  readonly inputs: readonly DocsApiRow[];
  readonly outputs: readonly DocsEventRow[];
  readonly cssVariables?: readonly DocsCssVariableRow[];
  readonly accessibility: readonly string[];
  readonly bestPractices: readonly string[];
  readonly commonMistakes?: readonly string[];
}

export interface ComponentGroup {
  readonly name: string;
  readonly icon: string;
  readonly slugs: readonly string[];
}

export interface ChartTypeDoc {
  readonly type: string;
  readonly title: string;
  readonly status: DocsStatus;
  readonly description: string;
  readonly whenToUse: readonly string[];
  readonly avoid?: readonly string[];
  readonly code: string;
}
