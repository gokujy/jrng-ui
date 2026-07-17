import { reflectComponentType } from '@angular/core';
import { JDynamicDialogComponent } from './dynamic-dialog.component';

describe('JDynamicDialogComponent public contract', () => {
  const metadata = reflectComponentType(JDynamicDialogComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-dynamic-dialog');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});
