import { Component, reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { JMenuItem } from 'jrng-ui/menu';
import { JTopbarComponent } from './topbar.component';

@Component({
  imports: [JTopbarComponent],
  template: `<j-topbar [model]="items" activeKey="Home" />`,
})
class TopbarHostComponent {
  commandCalls = 0;
  readonly items: readonly JMenuItem[] = [
    { id: 'home', label: 'Home', routerLink: '/', command: () => this.commandCalls++ },
    {
      id: 'disabled',
      label: 'Disabled',
      url: '/disabled',
      disabled: true,
      command: () => this.commandCalls++,
    },
    { id: 'hidden', label: 'Hidden', visible: false },
    { id: 'denied', label: 'Denied', permission: () => false },
  ];
}

describe('JTopbarComponent public contract', () => {
  const metadata = reflectComponentType(JTopbarComponent);

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-topbar');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('omits invisible and unauthorized items and marks the active page', () => {
    TestBed.configureTestingModule({
      imports: [TopbarHostComponent],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(TopbarHostComponent);
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll(
      '.j-topbar__link',
    ) as NodeListOf<HTMLAnchorElement>;
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('aria-current')).toBe('page');
  });

  it('prevents disabled items from navigating or executing commands', () => {
    TestBed.configureTestingModule({
      imports: [TopbarHostComponent],
      providers: [provideRouter([])],
    });
    const fixture: ComponentFixture<TopbarHostComponent> =
      TestBed.createComponent(TopbarHostComponent);
    fixture.detectChanges();
    const disabled = fixture.nativeElement.querySelectorAll(
      '.j-topbar__link',
    )[1] as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    expect(disabled.dispatchEvent(event)).toBe(false);
    expect(disabled.getAttribute('aria-disabled')).toBe('true');
    expect(disabled.tabIndex).toBe(-1);
    expect(fixture.componentInstance.commandCalls).toBe(0);
  });
});
