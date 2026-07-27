import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JGridLayoutComponent } from './grid-layout.component';

describe('JGridLayoutComponent public contract', () => {
  const metadata = reflectComponentType(JGridLayoutComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-grid-layout');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('exposes the configured responsive column limit and minimum item width', () => {
    const fixture = TestBed.createComponent(JGridLayoutComponent);
    fixture.componentRef.setInput('columns', 4);
    fixture.componentRef.setInput('minItemWidth', '14rem');
    fixture.detectChanges();
    const grid = fixture.nativeElement.querySelector('.j-grid-layout') as HTMLElement;
    expect(grid.style.getPropertyValue('--j-grid-columns')).toBe('4');
    expect(grid.style.getPropertyValue('--j-grid-min')).toBe('14rem');
  });
});
