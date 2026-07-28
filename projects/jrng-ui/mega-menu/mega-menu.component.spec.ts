import { ComponentFixture, TestBed } from '@angular/core/testing';
import { reflectComponentType } from '@angular/core';
import { JMegaMenuComponent, JMegaMenuItem } from './mega-menu.component';

describe('JMegaMenuComponent public contract', () => {
  const metadata = reflectComponentType(JMegaMenuComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-mega-menu');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});

describe('JMegaMenuComponent behavior', () => {
  let fixture: ComponentFixture<JMegaMenuComponent>;
  let element: HTMLElement;

  const model: readonly JMegaMenuItem[] = [
    {
      label: 'Products',
      groups: [
        {
          label: 'Manage',
          items: [
            { label: 'Accounts' },
            { label: 'Disabled entry', disabled: true },
            { label: 'Reports' },
          ],
        },
      ],
    },
    { label: 'Settings', groups: [{ label: 'Workspace', items: [{ label: 'Profile' }] }] },
    { label: 'Unavailable', disabled: true },
    { label: 'Hidden', visible: false },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [JMegaMenuComponent] }).compileComponents();
    fixture = TestBed.createComponent(JMegaMenuComponent);
    fixture.componentRef.setInput('model', model);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('connects an enabled trigger to an accessible menu panel', () => {
    const trigger = element.querySelector<HTMLButtonElement>('.j-mega-menu__button');

    trigger?.click();
    fixture.detectChanges();

    const panelId = trigger?.getAttribute('aria-controls');
    const panel = panelId ? element.querySelector<HTMLElement>(`#${panelId}`) : null;
    expect(trigger?.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(panel?.getAttribute('role')).toBe('menu');
    expect(panel?.querySelector('[role="menuitem"]')).not.toBeNull();
  });

  it('omits hidden items and prevents disabled top-level activation', () => {
    const triggers = element.querySelectorAll<HTMLButtonElement>('.j-mega-menu__button');

    expect(Array.from(triggers, (trigger) => trigger.textContent?.trim())).toEqual([
      'Products',
      'Settings',
      'Unavailable',
    ]);
    expect(triggers[2].disabled).toBe(true);
    triggers[2].click();
    fixture.detectChanges();
    expect(element.querySelector('.j-mega-menu__panel')).toBeNull();
  });

  it('opens with ArrowDown, skips disabled entries, and restores trigger focus on Escape', async () => {
    const trigger = element.querySelector<HTMLButtonElement>('.j-mega-menu__button');
    trigger?.focus();
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    await Promise.resolve();

    const entries = element.querySelectorAll<HTMLButtonElement>('.j-mega-menu__entry');
    expect(document.activeElement).toBe(entries[0]);

    entries[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(entries[2]);

    entries[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(trigger);
    expect(element.querySelector('.j-mega-menu__panel')).toBeNull();
  });

  it('moves between enabled top-level triggers with arrow keys and Home/End', () => {
    const triggers = element.querySelectorAll<HTMLButtonElement>('.j-mega-menu__button');
    triggers[0].focus();

    triggers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(triggers[1]);

    triggers[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(triggers[1]);

    triggers[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(triggers[0]);
  });

  it('emits a leaf command once and closes the panel', () => {
    const command = vi.fn();
    fixture.componentRef.setInput('model', [
      {
        label: 'Products',
        groups: [{ label: 'Manage', items: [{ label: 'Accounts', command }] }],
      },
    ] satisfies readonly JMegaMenuItem[]);
    fixture.detectChanges();

    element.querySelector<HTMLButtonElement>('.j-mega-menu__button')?.click();
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('.j-mega-menu__entry')?.click();
    fixture.detectChanges();

    expect(command).toHaveBeenCalledOnce();
    expect(element.querySelector('.j-mega-menu__panel')).toBeNull();
  });
});
