import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  JAccordionComponent,
  JAccordionContentComponent,
  JAccordionHeaderComponent,
  JAccordionPanelComponent,
  JAccordionVariant,
} from './accordion.component';

@Component({
  imports: [JAccordionComponent, JAccordionPanelComponent],
  template: `<j-accordion [variant]="variant" [activeIndex]="0">
    <j-accordion-panel header="Details">Long account details</j-accordion-panel>
    <j-accordion-panel header="Locked" disabled>Unavailable</j-accordion-panel>
  </j-accordion>`,
})
class AccordionVariantHost {
  variant: JAccordionVariant = 'default';
}

@Component({
  imports: [
    JAccordionComponent,
    JAccordionPanelComponent,
    JAccordionHeaderComponent,
    JAccordionContentComponent,
  ],
  template: `<j-accordion [(value)]="activeValue">
    <j-accordion-panel value="profile">
      <j-accordion-header>Profile settings</j-accordion-header>
      <j-accordion-content>Profile content</j-accordion-content>
    </j-accordion-panel>
    <j-accordion-panel value="security" header="Security">Security content</j-accordion-panel>
  </j-accordion>`,
})
class AccordionCompositionHost {
  activeValue: string | number | readonly (string | number)[] | null = 'profile';
}

describe('JAccordionComponent variants', () => {
  let fixture: ComponentFixture<AccordionVariantHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AccordionVariantHost] }).compileComponents();
    fixture = TestBed.createComponent(AccordionVariantHost);
    fixture.detectChanges();
  });

  it('propagates separated and minimal presentations to panels', () => {
    fixture.componentInstance.variant = 'separated';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('.j-accordion')).classes['j-accordion--separated'],
    ).toBe(true);
    expect(
      fixture.debugElement.query(By.css('.j-accordion-panel')).classes[
        'j-accordion-panel--separated'
      ],
    ).toBe(true);
  });

  it('preserves expanded and disabled semantics', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons[0].attributes['aria-expanded']).toBe('true');
    expect((buttons[1].nativeElement as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('JAccordionComponent composition', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AccordionCompositionHost] });
  });

  it('supports projected header/content primitives and value-based control', () => {
    const fixture = TestBed.createComponent(AccordionCompositionHost);
    fixture.detectChanges();
    const accordion = fixture.debugElement.query(By.directive(JAccordionComponent))
      .componentInstance as JAccordionComponent;
    expect(accordion.value()).toBe('profile');
    expect(accordion.panels?.length).toBe(2);
    expect(accordion.panels?.first.value()).toBe('profile');
    const buttons = fixture.debugElement.queryAll(By.css('.j-accordion-panel__button'));
    expect(buttons[0].nativeElement.textContent).toContain('Profile settings');
    expect(buttons[0].attributes['aria-expanded']).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Profile content');

    buttons[1].triggerEventHandler('click');
    fixture.detectChanges();
    expect(fixture.componentInstance.activeValue).toBe('security');
    expect(buttons[1].attributes['aria-expanded']).toBe('true');
  });
});
