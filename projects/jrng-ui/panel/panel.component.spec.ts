import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JPanelComponent } from './panel.component';

describe('JPanelComponent public contract', () => {
  const metadata = reflectComponentType(JPanelComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-panel');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});

describe('JPanelComponent behavior', () => {
  it('renders loading, error, and empty states without exposing stale content', () => {
    const fixture = TestBed.createComponent(JPanelComponent);
    fixture.componentRef.setInput('header', 'Results');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('j-skeleton')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('section').getAttribute('aria-busy')).toBe('true');

    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('error', 'Network unavailable');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Network unavailable');

    fixture.componentRef.setInput('error', '');
    fixture.componentRef.setInput('empty', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No content');
  });

  it('blocks collapse changes while disabled', () => {
    const fixture = TestBed.createComponent(JPanelComponent);
    fixture.componentRef.setInput('toggleable', true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const emit = vi.spyOn(fixture.componentInstance.collapsedChange, 'emit');
    fixture.componentInstance.toggle();
    expect(emit).not.toHaveBeenCalled();
  });
});
