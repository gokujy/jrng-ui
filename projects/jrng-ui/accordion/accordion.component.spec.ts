import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  JAccordionComponent,
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
