import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JMenuComponent } from './menu.component';

describe('JMenuComponent public contract', () => {
  const metadata = reflectComponentType(JMenuComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-menu');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});

describe('JMenuComponent item model', () => {
  it('renders shared icon, badge, shortcut, tooltip and destructive metadata', () => {
    const fixture = TestBed.createComponent(JMenuComponent);
    fixture.componentRef.setInput('model', [
      {
        id: 'delete',
        label: 'Delete',
        icon: 'trash',
        badge: 2,
        badgeSeverity: 'danger',
        shortcut: '⌘⌫',
        tooltip: 'Delete selected records',
        destructive: true,
      },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('j-icon')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('j-badge')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('kbd')?.textContent).toContain('⌘⌫');
    expect(fixture.nativeElement.querySelector('.j-menu__item--destructive')).not.toBeNull();
  });

  it('excludes hidden and unauthorized items from rendering and navigation', () => {
    const fixture = TestBed.createComponent(JMenuComponent);
    fixture.componentRef.setInput('model', [
      { label: 'Hidden', visible: false },
      { label: 'Denied', permission: () => false },
      { label: 'Visible', children: [{ label: 'Child' }] },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Hidden');
    expect(fixture.nativeElement.textContent).not.toContain('Denied');
    expect(fixture.nativeElement.textContent).toContain('Visible');
    fixture.componentInstance.show();
    expect(fixture.componentInstance.activePath).toContain('Visible');
  });

  it('keeps the first enabled item tabbable when disabled items precede it', () => {
    const fixture = TestBed.createComponent(JMenuComponent);
    fixture.componentRef.setInput('model', [
      { label: 'Unavailable', disabled: true },
      { label: 'Open' },
    ]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const list = element.querySelector<HTMLElement>('.j-menu__list');
    const buttons = element.querySelectorAll<HTMLButtonElement>('.j-menu__button');

    expect(list?.tabIndex).toBe(-1);
    expect(buttons[0].tabIndex).toBe(-1);
    expect(buttons[1].tabIndex).toBe(0);
  });

  it('activates and focuses the item matching the active path rather than its raw DOM index', async () => {
    const firstCommand = vi.fn();
    const secondCommand = vi.fn();
    const fixture = TestBed.createComponent(JMenuComponent);
    fixture.componentRef.setInput('model', [
      { label: 'Unavailable', disabled: true },
      { label: 'Open', command: firstCommand },
      { label: 'Archive', command: secondCommand },
    ]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const buttons = element.querySelectorAll<HTMLButtonElement>('.j-menu__button');

    buttons[1].focus();
    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(firstCommand).toHaveBeenCalledOnce();

    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(buttons[2]);
    expect(secondCommand).not.toHaveBeenCalled();
  });
});
