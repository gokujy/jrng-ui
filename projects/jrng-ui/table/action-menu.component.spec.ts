import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JActionMenuComponent } from './action-menu.component';

describe('JActionMenuComponent public contract', () => {
  const metadata = reflectComponentType(JActionMenuComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-action-menu');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('closes a popup menu when focus leaves the trigger and menu', async () => {
    const fixture = TestBed.createComponent(JActionMenuComponent);
    fixture.componentRef.setInput('popup', true);
    fixture.componentRef.setInput('row', { id: 1 });
    fixture.componentRef.setInput('actions', [{ key: 'view', label: 'View' }]);
    fixture.detectChanges();

    fixture.componentInstance.toggle(new MouseEvent('click'));
    fixture.detectChanges();
    await Promise.resolve();

    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();
    fixture.componentInstance.handleFocusOut();
    await Promise.resolve();

    expect(fixture.componentInstance.open).toBe(false);
    outside.remove();
  });
});
