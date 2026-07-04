import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JrCardComponent, JrCardVariant } from './card.component';

@Component({
  imports: [JrCardComponent],
  template: `
    <j-card [title]="title" [subtitle]="subtitle" [variant]="variant" [clickable]="clickable">
      <div jCardHeader>Custom header</div>
      <p>Main body</p>
      <div jCardBody>Extra body</div>
      <button jCardFooter>Action</button>
    </j-card>
  `,
})
class CardHostComponent {
  title = 'Metric';
  subtitle = 'Quarter to date';
  variant: JrCardVariant = 'default';
  clickable = false;
}

describe('JrCardComponent', () => {
  let fixture: ComponentFixture<CardHostComponent>;
  let host: CardHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function card(): HTMLElement {
    return fixture.debugElement.query(By.css('article')).nativeElement as HTMLElement;
  }

  function detectHostChanges(): void {
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  }

  it('renders title, subtitle, and projected content', () => {
    expect(card().textContent).toContain('Metric');
    expect(card().textContent).toContain('Quarter to date');
    expect(card().textContent).toContain('Custom header');
    expect(card().textContent).toContain('Main body');
    expect(card().textContent).toContain('Extra body');
    expect(card().textContent).toContain('Action');
  });

  it('applies variant class', () => {
    host.variant = 'soft';
    detectHostChanges();

    expect(card().classList).toContain('j-card--soft');
  });

  it('uses button semantics when clickable', () => {
    host.clickable = true;
    detectHostChanges();

    expect(card().getAttribute('role')).toBe('button');
    expect(card().getAttribute('tabindex')).toBe('0');
  });
});
