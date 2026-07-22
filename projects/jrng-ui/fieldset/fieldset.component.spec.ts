import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JFieldsetComponent } from './fieldset.component';

describe('JFieldsetComponent public contract', () => {
  const metadata = reflectComponentType(JFieldsetComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-fieldset');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});

describe('JFieldsetComponent behavior', () => {
  it('applies variants and blocks toggling while disabled or read-only', () => {
    const fixture = TestBed.createComponent(JFieldsetComponent);
    fixture.componentRef.setInput('legend', 'Permissions');
    fixture.componentRef.setInput('toggleable', true);
    fixture.componentRef.setInput('variant', 'elevated');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const emit = vi.spyOn(component.collapsedChange, 'emit');

    component.toggle();
    expect(emit).not.toHaveBeenCalled();
    expect((fixture.nativeElement.querySelector('fieldset') as HTMLFieldSetElement).disabled).toBe(
      true,
    );
    expect(fixture.nativeElement.querySelector('.j-fieldset--elevated')).not.toBeNull();

    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    component.toggle();
    expect(emit).toHaveBeenCalledWith(true);
  });
});
