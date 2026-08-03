import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JSortIconComponent } from './sort-icon.component';

describe('JSortIconComponent public contract', () => {
  const metadata = reflectComponentType(JSortIconComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-sort-icon');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('keeps the compact icon size and emphasizes only the active icon', () => {
    const fixture = TestBed.createComponent(JSortIconComponent);
    fixture.detectChanges();

    let icon = fixture.nativeElement.querySelector('j-icon svg');
    expect(icon.style.fontSize).toBe('0.875rem');
    expect(icon.getAttribute('stroke-width')).toBe('2');

    fixture.componentRef.setInput('order', 1);
    fixture.detectChanges();
    icon = fixture.nativeElement.querySelector('j-icon svg');
    expect(icon.getAttribute('stroke-width')).toBe('3');
    expect(fixture.nativeElement.querySelector('.j-sort-icon').classList).toContain('is-active');
  });
});
