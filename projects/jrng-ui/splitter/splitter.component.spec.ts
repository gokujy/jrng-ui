import { Component, reflectComponentType, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JSplitterComponent, JSplitterPanelComponent } from './splitter.component';

@Component({
  imports: [JSplitterComponent, JSplitterPanelComponent],
  template: `<j-splitter [disabled]="disabled()">
    <j-splitter-panel [size]="40">Navigation</j-splitter-panel>
    <j-splitter-panel [size]="60">Content</j-splitter-panel>
  </j-splitter>`,
})
class SplitterHost {
  readonly disabled = signal(false);
}

describe('JSplitterComponent public contract', () => {
  const metadata = reflectComponentType(JSplitterComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-splitter');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});

describe('JSplitterComponent interaction', () => {
  let fixture: ComponentFixture<SplitterHost>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SplitterHost] });
    fixture = TestBed.createComponent(SplitterHost);
    fixture.detectChanges();
  });

  it('resizes adjacent panels with the keyboard and resets on double click', () => {
    const splitter = fixture.debugElement.query(By.directive(JSplitterComponent))
      .componentInstance as JSplitterComponent;
    const separator = fixture.debugElement.query(By.css('[role="separator"]'));
    separator.triggerEventHandler('keydown', new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(splitter.sizes()).toEqual([90, 10]);

    separator.triggerEventHandler('dblclick', new MouseEvent('dblclick'));
    expect(splitter.sizes()).toEqual([40, 60]);
  });

  it('blocks resizing after a runtime disabled change', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    const splitter = fixture.debugElement.query(By.directive(JSplitterComponent))
      .componentInstance as JSplitterComponent;
    const separator = fixture.debugElement.query(By.css('[role="separator"]'));
    separator.triggerEventHandler('keydown', new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(splitter.sizes()).toEqual([40, 60]);
    expect(separator.attributes['aria-disabled']).toBe('true');
  });
});
