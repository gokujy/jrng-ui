import { reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JContextMenuComponent } from './context-menu.component';

describe('JContextMenuComponent public contract', () => {
  const metadata = reflectComponentType(JContextMenuComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-context-menu');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});

describe('JContextMenuComponent keyboard targeting', () => {
  let firstFixture: ComponentFixture<JContextMenuComponent>;
  let secondFixture: ComponentFixture<JContextMenuComponent>;
  let firstTarget: HTMLButtonElement;
  let secondTarget: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [JContextMenuComponent] }).compileComponents();
    firstTarget = document.createElement('button');
    secondTarget = document.createElement('button');
    document.body.append(firstTarget, secondTarget);
    firstFixture = TestBed.createComponent(JContextMenuComponent);
    secondFixture = TestBed.createComponent(JContextMenuComponent);
    firstFixture.componentRef.setInput('target', firstTarget);
    secondFixture.componentRef.setInput('target', secondTarget);
    firstFixture.detectChanges();
    secondFixture.detectChanges();
  });

  afterEach(() => {
    firstFixture.destroy();
    secondFixture.destroy();
    firstTarget.remove();
    secondTarget.remove();
  });

  it('opens only the context menu owning the focused target', () => {
    firstTarget.focus();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'F10', shiftKey: true, bubbles: true }),
    );

    expect(firstFixture.componentInstance.visible).toBe(true);
    expect(secondFixture.componentInstance.visible).toBe(false);
  });

  it('ignores the context-menu key outside its configured target', () => {
    const unrelated = document.createElement('button');
    document.body.append(unrelated);
    unrelated.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ContextMenu', bubbles: true }));

    expect(firstFixture.componentInstance.visible).toBe(false);
    expect(secondFixture.componentInstance.visible).toBe(false);
    unrelated.remove();
  });
});
