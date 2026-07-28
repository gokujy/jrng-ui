import { reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JPopoverComponent } from './popover.component';

describe('JPopoverComponent', () => {
  const metadata = reflectComponentType(JPopoverComponent);
  let fixture: ComponentFixture<JPopoverComponent>;
  let component: JPopoverComponent;
  let target: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [JPopoverComponent] });
    fixture = TestBed.createComponent(JPopoverComponent);
    component = fixture.componentInstance;
    target = document.createElement('button');
    document.body.append(target);
  });

  afterEach(() => {
    fixture.destroy();
    target.remove();
  });

  async function open(): Promise<void> {
    component.show(target);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
  }

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-popover');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('provides an accessible default name', async () => {
    await open();
    expect(
      (fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement).getAttribute(
        'aria-label',
      ),
    ).toBe('Popover');
  });

  it('does not repeat the open lifecycle when positioning inputs change', async () => {
    let opened = 0;
    component.opened.subscribe(() => opened++);
    await open();
    expect(opened).toBe(1);

    fixture.componentRef.setInput('position', 'top');
    fixture.detectChanges();
    await Promise.resolve();

    expect(opened).toBe(1);
  });

  it('clamps the panel within the right and bottom viewport edges', async () => {
    Object.defineProperty(target, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 790, right: 810, top: 590, bottom: 610, width: 20, height: 20 }),
    });
    await open();
    const panel = fixture.nativeElement.querySelector('.j-popover') as HTMLElement;
    Object.defineProperty(panel, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 0, right: 300, top: 0, bottom: 200, width: 300, height: 200 }),
    });
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();

    expect(component.left).toBeLessThanOrEqual(window.innerWidth - 300 - 8);
    expect(component.top).toBeLessThanOrEqual(window.innerHeight - 200 - 8);
  });

  it('allows only the topmost popover to dismiss itself as an outside click', async () => {
    const secondFixture = TestBed.createComponent(JPopoverComponent);
    const second = secondFixture.componentInstance;
    await open();
    second.show(target);
    secondFixture.detectChanges();
    await Promise.resolve();

    component.handleOutside();
    expect(component.visible()).toBe(true);
    second.handleOutside();
    expect(second.visible()).toBe(false);
    secondFixture.destroy();
  });
});
