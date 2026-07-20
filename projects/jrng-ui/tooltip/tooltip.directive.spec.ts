import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, describe, expect, it } from 'vitest';
import { JTooltipDirective } from './tooltip.directive';

@Component({
  standalone: true,
  imports: [JTooltipDirective],
  template: '<button jTooltip="Hello" tooltipPosition="top">x</button>',
})
class HostComponent {}

@Component({
  standalone: true,
  imports: [JTooltipDirective],
  template: '<button jTooltip="Nope" [tooltipDisabled]="true">x</button>',
})
class DisabledHostComponent {}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

function getDirective(fixtureComponent: new () => object): {
  directive: JTooltipDirective;
  destroy: () => void;
} {
  const fixture = TestBed.createComponent(fixtureComponent);
  fixture.detectChanges();
  const directive = fixture.debugElement
    .query(By.directive(JTooltipDirective))
    .injector.get(JTooltipDirective);
  return { directive, destroy: () => fixture.destroy() };
}

describe('JTooltipDirective', () => {
  afterEach(() => {
    document.querySelectorAll('.j-tooltip').forEach((element) => element.remove());
  });

  it('creates a .j-tooltip element on show() with the text, role and position class', async () => {
    const { directive } = getDirective(HostComponent);

    directive.show();
    await tick();

    const tooltip = document.querySelector('.j-tooltip');
    expect(tooltip).not.toBeNull();
    expect(tooltip?.textContent).toBe('Hello');
    expect(tooltip?.getAttribute('role')).toBe('tooltip');
    expect(['top', 'bottom']).toContain(tooltip?.getAttribute('data-j-placement'));
    expect(tooltip?.querySelector('.j-tooltip__arrow')).not.toBeNull();
    expect(document.querySelector('button')?.getAttribute('aria-describedby')).toBe(tooltip?.id);
  });

  it('removes the tooltip element on hide()', async () => {
    const { directive } = getDirective(HostComponent);

    directive.show();
    await tick();
    expect(document.querySelector('.j-tooltip')).not.toBeNull();

    directive.hide();
    await tick();
    expect(document.querySelector('.j-tooltip')).toBeNull();
  });

  it('does not create a tooltip when tooltipDisabled is true', async () => {
    const { directive } = getDirective(DisabledHostComponent);

    directive.show();
    await tick();

    expect(document.querySelector('.j-tooltip')).toBeNull();
  });

  it('removes the tooltip when the host is destroyed', async () => {
    const { directive, destroy } = getDirective(HostComponent);

    directive.show();
    await tick();
    expect(document.querySelector('.j-tooltip')).not.toBeNull();

    destroy();
    expect(document.querySelector('.j-tooltip')).toBeNull();
  });

  it('closes on Escape and clears the ARIA relationship', async () => {
    const { directive } = getDirective(HostComponent);
    directive.show();
    await tick();
    directive.closeOnEscape(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector('.j-tooltip')).toBeNull();
    expect(document.querySelector('button')?.hasAttribute('aria-describedby')).toBe(false);
  });
});
