import {
  JTableCellTemplateDirective,
  JTableHeaderTemplateDirective,
  JTableFilterTemplateDirective,
  JTableActionsTemplateDirective,
  JTableEmptyTemplateDirective,
  JTableLoadingTemplateDirective,
} from './table-template.directive';

describe('JTableCellTemplateDirective public contract', () => {
  const metadata = (
    JTableCellTemplateDirective as unknown as {
      ɵdir: {
        selectors: unknown[];
        inputs: Record<string, unknown>;
        outputs: Record<string, unknown>;
      };
    }
  ).ɵdir;

  it('publishes Angular directive metadata', () => {
    expect(metadata).toBeDefined();
    expect(metadata.selectors.length).toBeGreaterThan(0);
  });

  it('keeps input and output aliases unique', () => {
    expect(new Set(Object.keys(metadata.inputs)).size).toBe(Object.keys(metadata.inputs).length);
    expect(new Set(Object.keys(metadata.outputs)).size).toBe(Object.keys(metadata.outputs).length);
  });
});

describe('JTableHeaderTemplateDirective public contract', () => {
  const metadata = (
    JTableHeaderTemplateDirective as unknown as {
      ɵdir: {
        selectors: unknown[];
        inputs: Record<string, unknown>;
        outputs: Record<string, unknown>;
      };
    }
  ).ɵdir;

  it('publishes Angular directive metadata', () => {
    expect(metadata).toBeDefined();
    expect(metadata.selectors.length).toBeGreaterThan(0);
  });

  it('keeps input and output aliases unique', () => {
    expect(new Set(Object.keys(metadata.inputs)).size).toBe(Object.keys(metadata.inputs).length);
    expect(new Set(Object.keys(metadata.outputs)).size).toBe(Object.keys(metadata.outputs).length);
  });
});

describe('JTableFilterTemplateDirective public contract', () => {
  const metadata = (
    JTableFilterTemplateDirective as unknown as {
      ɵdir: {
        selectors: unknown[];
        inputs: Record<string, unknown>;
        outputs: Record<string, unknown>;
      };
    }
  ).ɵdir;

  it('publishes Angular directive metadata', () => {
    expect(metadata).toBeDefined();
    expect(metadata.selectors.length).toBeGreaterThan(0);
  });

  it('keeps input and output aliases unique', () => {
    expect(new Set(Object.keys(metadata.inputs)).size).toBe(Object.keys(metadata.inputs).length);
    expect(new Set(Object.keys(metadata.outputs)).size).toBe(Object.keys(metadata.outputs).length);
  });
});

describe('JTableActionsTemplateDirective public contract', () => {
  const metadata = (
    JTableActionsTemplateDirective as unknown as {
      ɵdir: {
        selectors: unknown[];
        inputs: Record<string, unknown>;
        outputs: Record<string, unknown>;
      };
    }
  ).ɵdir;

  it('publishes Angular directive metadata', () => {
    expect(metadata).toBeDefined();
    expect(metadata.selectors.length).toBeGreaterThan(0);
  });

  it('keeps input and output aliases unique', () => {
    expect(new Set(Object.keys(metadata.inputs)).size).toBe(Object.keys(metadata.inputs).length);
    expect(new Set(Object.keys(metadata.outputs)).size).toBe(Object.keys(metadata.outputs).length);
  });
});

describe('JTableEmptyTemplateDirective public contract', () => {
  const metadata = (
    JTableEmptyTemplateDirective as unknown as {
      ɵdir: {
        selectors: unknown[];
        inputs: Record<string, unknown>;
        outputs: Record<string, unknown>;
      };
    }
  ).ɵdir;

  it('publishes Angular directive metadata', () => {
    expect(metadata).toBeDefined();
    expect(metadata.selectors.length).toBeGreaterThan(0);
  });

  it('keeps input and output aliases unique', () => {
    expect(new Set(Object.keys(metadata.inputs)).size).toBe(Object.keys(metadata.inputs).length);
    expect(new Set(Object.keys(metadata.outputs)).size).toBe(Object.keys(metadata.outputs).length);
  });
});

describe('JTableLoadingTemplateDirective public contract', () => {
  const metadata = (
    JTableLoadingTemplateDirective as unknown as {
      ɵdir: {
        selectors: unknown[];
        inputs: Record<string, unknown>;
        outputs: Record<string, unknown>;
      };
    }
  ).ɵdir;

  it('publishes Angular directive metadata', () => {
    expect(metadata).toBeDefined();
    expect(metadata.selectors.length).toBeGreaterThan(0);
  });

  it('keeps input and output aliases unique', () => {
    expect(new Set(Object.keys(metadata.inputs)).size).toBe(Object.keys(metadata.inputs).length);
    expect(new Set(Object.keys(metadata.outputs)).size).toBe(Object.keys(metadata.outputs).length);
  });
});
