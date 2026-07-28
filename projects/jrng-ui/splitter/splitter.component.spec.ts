import { Component, reflectComponentType, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JSplitterComponent, JSplitterPanelComponent } from './splitter.component';

@Component({
  imports: [JSplitterComponent, JSplitterPanelComponent],
  template: `<j-splitter
    [disabled]="disabled()"
    [readOnly]="readOnly()"
    [storageKey]="storageKey()"
  >
    <j-splitter-panel [size]="40">Navigation</j-splitter-panel>
    <j-splitter-panel [size]="60">Content</j-splitter-panel>
  </j-splitter>`,
})
class SplitterHost {
  readonly disabled = signal(false);
  readonly readOnly = signal(false);
  readonly storageKey = signal<string | null>(null);
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
    fixture.detectChanges();
    expect(separator.attributes['aria-valuemin']).toBe('10');
    expect(separator.attributes['aria-valuenow']).toBe('90');
    expect(separator.attributes['aria-valuemax']).toBe('90');

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

  it('blocks pointer and reset interactions when read only', () => {
    fixture.componentInstance.readOnly.set(true);
    fixture.detectChanges();
    const splitter = fixture.debugElement.query(By.directive(JSplitterComponent))
      .componentInstance as JSplitterComponent;
    const separator = fixture.debugElement.query(By.css('[role="separator"]'));

    separator.triggerEventHandler('dblclick', new MouseEvent('dblclick'));
    separator.triggerEventHandler('pointerdown', {
      preventDefault: vi.fn(),
      clientX: 10,
      clientY: 10,
    });

    expect(splitter.sizes()).toEqual([40, 60]);
    expect(separator.attributes['tabindex']).toBe('-1');
  });

  it('removes active pointer listeners when its panel is destroyed', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const separator = fixture.debugElement.query(By.css('[role="separator"]'));

    separator.triggerEventHandler('pointerdown', {
      preventDefault: vi.fn(),
      clientX: 10,
      clientY: 10,
    });
    expect(add).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(add).toHaveBeenCalledWith('pointercancel', expect.any(Function), { once: true });

    fixture.destroy();

    expect(remove).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('pointercancel', expect.any(Function));
  });

  it('restores only valid persisted panel sizes', () => {
    fixture.destroy();
    localStorage.setItem('splitter-valid', JSON.stringify([45, 55]));
    fixture = TestBed.createComponent(SplitterHost);
    fixture.componentInstance.storageKey.set('splitter-valid');
    fixture.detectChanges();
    let splitter = fixture.debugElement.query(By.directive(JSplitterComponent))
      .componentInstance as JSplitterComponent;
    expect(splitter.sizes()).toEqual([45, 55]);

    fixture.destroy();
    localStorage.setItem('splitter-invalid', JSON.stringify([95, 5]));
    fixture = TestBed.createComponent(SplitterHost);
    fixture.componentInstance.storageKey.set('splitter-invalid');
    fixture.detectChanges();
    splitter = fixture.debugElement.query(By.directive(JSplitterComponent))
      .componentInstance as JSplitterComponent;
    expect(splitter.sizes()).toEqual([40, 60]);
    localStorage.removeItem('splitter-valid');
    localStorage.removeItem('splitter-invalid');
  });
});
