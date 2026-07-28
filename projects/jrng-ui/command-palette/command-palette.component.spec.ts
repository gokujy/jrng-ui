import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JCommandPaletteComponent } from './command-palette.component';

describe('JCommandPaletteComponent public contract', () => {
  const metadata = reflectComponentType(JCommandPaletteComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-command-palette');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});

describe('JCommandPaletteComponent behavior', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JCommandPaletteComponent],
    }).compileComponents();
  });

  it('starts ArrowDown navigation at the first enabled result', () => {
    const fixture = TestBed.createComponent(JCommandPaletteComponent);
    fixture.componentRef.setInput('commands', [
      { label: 'Disabled', disabled: true },
      { label: 'Open account' },
      { label: 'Open report' },
    ]);
    fixture.detectChanges();

    fixture.componentInstance.handleSearchKeydown(
      new KeyboardEvent('keydown', { key: 'ArrowDown' }),
    );

    expect(fixture.componentInstance.activeItem()?.label).toBe('Open account');
  });

  it('resets the active option to a valid enabled result when filtering', () => {
    const fixture = TestBed.createComponent(JCommandPaletteComponent);
    fixture.componentRef.setInput('commands', [
      { label: 'Open account' },
      { label: 'Archive report', disabled: true },
      { label: 'Open report' },
    ]);
    fixture.detectChanges();

    fixture.componentInstance.setQuery('report');

    expect(fixture.componentInstance.activeItem()?.label).toBe('Open report');
  });

  it('connects the combobox to its listbox and active option', () => {
    const fixture = TestBed.createComponent(JCommandPaletteComponent);
    fixture.componentRef.setInput('commands', [{ label: 'Open account' }]);
    fixture.componentInstance.visible.set(true);
    fixture.componentInstance.setQuery('');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector<HTMLInputElement>('[role="combobox"]');
    const listbox = element.querySelector<HTMLElement>('[role="listbox"]');
    const option = element.querySelector<HTMLButtonElement>('[role="option"]');

    expect(input?.getAttribute('aria-controls')).toBe(listbox?.id);
    expect(input?.getAttribute('aria-activedescendant')).toBe(option?.id);
    expect(option?.tabIndex).toBe(-1);
  });

  it('allows only one instance to claim a global shortcut event', () => {
    const first = TestBed.createComponent(JCommandPaletteComponent);
    const second = TestBed.createComponent(JCommandPaletteComponent);
    first.detectChanges();
    second.detectChanges();

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true }),
    );

    expect(first.componentInstance.visible()).toBe(true);
    expect(second.componentInstance.visible()).toBe(false);
    first.destroy();
    second.destroy();
  });
});
