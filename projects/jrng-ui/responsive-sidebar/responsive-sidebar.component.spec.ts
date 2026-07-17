import { reflectComponentType } from '@angular/core';
import { JResponsiveSidebarComponent } from './responsive-sidebar.component';

describe('JResponsiveSidebarComponent public contract', () => {
  const metadata = reflectComponentType(JResponsiveSidebarComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-responsive-sidebar');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});
