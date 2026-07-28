import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JAppShellComponent } from './app-shell.component';

describe('JAppShellComponent public contract', () => {
  const metadata = reflectComponentType(JAppShellComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-app-shell');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('links the toggle to the labelled sidebar and restores focus on Escape', () => {
    const fixture = TestBed.createComponent(JAppShellComponent);
    fixture.componentRef.setInput('sidebarOpen', true);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.j-app-shell__toggle') as HTMLButtonElement;
    const sidebar = fixture.nativeElement.querySelector('.j-app-shell__sidebar') as HTMLElement;

    expect(toggle.getAttribute('aria-controls')).toBe(sidebar.id);
    expect(sidebar.getAttribute('aria-label')).toBe('Primary navigation');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.sidebarOpen()).toBe(false);
    expect(document.activeElement).toBe(toggle);
  });
});
