import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JSparklineComponent } from './sparkline.component';

describe('JSparklineComponent public contract', () => {
  const metadata = reflectComponentType(JSparklineComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-sparkline');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('normalizes invalid dimensions and values without emitting NaN geometry', () => {
    const fixture = TestBed.createComponent(JSparklineComponent);
    fixture.componentRef.setInput('width', Number.NaN);
    fixture.componentRef.setInput('height', -2);
    fixture.componentRef.setInput('value', [1, Number.NaN, Number.POSITIVE_INFINITY]);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('viewBox')).toBe('0 0 120 1');
    expect(fixture.componentInstance.linePoints()).not.toContain('NaN');
    expect(fixture.componentInstance.linePoints()).not.toContain('Infinity');
  });
});
