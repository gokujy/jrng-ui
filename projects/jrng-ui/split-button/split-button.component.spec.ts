import { Component, signal, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JMenuItem } from 'jrng-ui/menu';
import { JSplitButtonComponent, JSplitButtonItemDirective } from './split-button.component';

@Component({
  imports: [JSplitButtonComponent, JSplitButtonItemDirective],
  template: `
    <j-split-button
      label="Save customer"
      [model]="items"
      [disabled]="disabled()"
      (primaryAction)="recordPrimary()"
      (menuAction)="selected.push($event.item)"
    >
      <ng-template jSplitButtonItem let-item>{{ item.label }}</ng-template>
    </j-split-button>
  `,
})
class SplitButtonHostComponent {
  @ViewChild(JSplitButtonComponent) component!: JSplitButtonComponent;
  primaryCount = 0;
  readonly disabled = signal(false);
  selected: JMenuItem[] = [];
  readonly items: JMenuItem[] = [
    { label: 'Save and close' },
    { separator: true },
    { label: 'Unavailable', disabled: true },
  ];

  recordPrimary(): void {
    this.primaryCount++;
  }
}

describe('JSplitButtonComponent', () => {
  let fixture: ComponentFixture<SplitButtonHostComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitButtonHostComponent);
    fixture.detectChanges();
  });

  it('emits a separate primary action', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    expect(fixture.componentInstance.primaryCount).toBe(1);
  });

  it('opens with ArrowDown, supports menu activation, and restores focus', async () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown', cancelable: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.component.menuOpen).toBe(true);
    const menuButton = fixture.nativeElement.querySelector(
      '[role="menuitem"]',
    ) as HTMLButtonElement;
    menuButton.click();
    fixture.detectChanges();
    await Promise.resolve();
    expect(fixture.componentInstance.selected[0]?.label).toBe('Save and close');
    expect(document.activeElement).toBe(buttons[1]);
  });

  it('blocks both controls when disabled', () => {
    const component = fixture.componentInstance.component;
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    component.openMenu();
    expect(component.menuOpen).toBe(false);
  });
});
