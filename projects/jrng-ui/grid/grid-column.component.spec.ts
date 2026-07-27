import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JGridColumnComponent } from './grid-column.component';

describe('JGridColumnComponent public contract', () => {
  const metadata = reflectComponentType(JGridColumnComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-col');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('resolves column spans and offsets against the inherited column count', () => {
    const fixture = TestBed.createComponent(JGridColumnComponent);
    fixture.componentRef.setInput('size', 6);
    fixture.componentRef.setInput('offset', 2);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.style.getPropertyValue('--j-col-width')).toContain('--j-grid-column-count');
    expect(host.style.getPropertyValue('--j-col-offset')).toContain('--j-grid-column-count');
  });
});
