import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JAnchorComponent, JAnchorLink } from './anchor.component';

@Component({
  imports: [JAnchorComponent],
  template: `
    <j-anchor
      [links]="links"
      [(activeId)]="active"
      [updateFragment]="false"
      (navigated)="navigated = navigated + 1"
    />
    <section id="overview" tabindex="-1">Overview</section>
    <section id="details" tabindex="-1">Details</section>
  `,
})
class AnchorHostComponent {
  readonly links: readonly JAnchorLink[] = [
    { id: 'overview', label: 'Overview' },
    {
      id: 'details',
      label: 'Details',
      children: [{ id: 'missing', label: 'Missing', disabled: true }],
    },
  ];
  active = '';
  navigated = 0;
}

describe('JAnchorComponent', () => {
  let fixture: ComponentFixture<AnchorHostComponent>;
  let component: JAnchorComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnchorHostComponent);
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
    window.scrollTo = vi.fn();
  });

  it('renders nested links with navigation semantics', () => {
    const navigation = fixture.nativeElement.querySelector('nav');
    expect(navigation.getAttribute('aria-label')).toBe('On this page');
    expect(fixture.nativeElement.querySelectorAll('a')).toHaveLength(3);
    expect(fixture.nativeElement.querySelector('[aria-disabled="true"]')).toBeTruthy();
  });

  it('navigates programmatically, updates state, and can focus the section', () => {
    expect(component.navigate('details', true)).toBe(true);
    expect(fixture.componentInstance.active).toBe('details');
    expect(fixture.componentInstance.navigated).toBe(1);
    expect(document.activeElement?.id).toBe('details');
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it('blocks disabled and missing links', () => {
    expect(component.navigate('missing')).toBe(false);
    expect(component.navigate('unknown')).toBe(false);
  });

  it('moves focus with orientation-aware arrow keys', () => {
    const links = fixture.nativeElement.querySelectorAll('a');
    links[0].focus();
    links[0].dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowDown' }),
    );
    expect(document.activeElement).toBe(links[1]);
  });
});
