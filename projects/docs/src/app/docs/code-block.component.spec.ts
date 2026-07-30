import { TestBed } from '@angular/core/testing';
import { CodeBlockComponent } from './code-block.component';

describe('CodeBlockComponent', () => {
  it('copies the current code and exposes copied feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    await TestBed.configureTestingModule({ imports: [CodeBlockComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CodeBlockComponent);
    fixture.componentRef.setInput('code', '<j-button label="Save" />');
    fixture.detectChanges();
    fixture.componentInstance.copy();
    await Promise.resolve();
    expect(writeText).toHaveBeenCalledWith('<j-button label="Save" />');
    expect(fixture.componentInstance.copied()).toBe(true);
  });

  it('uses a collapsible code viewport and toggles its expanded state', async () => {
    await TestBed.configureTestingModule({ imports: [CodeBlockComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CodeBlockComponent);
    fixture.componentRef.setInput('collapsible', true);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.j-doc-code') as HTMLElement;
    const expandButton = fixture.nativeElement.querySelector(
      '[aria-label="Expand code"]',
    ) as HTMLButtonElement;
    expect(root.classList.contains('j-doc-code--collapsible')).toBe(true);
    expect(root.classList.contains('is-expanded')).toBe(false);
    expect(expandButton.getAttribute('aria-expanded')).toBe('false');

    expandButton.click();
    fixture.detectChanges();
    expect(root.classList.contains('is-expanded')).toBe(true);
    expect(fixture.nativeElement.querySelector('[aria-label="Collapse code"]')).toBeTruthy();
  });
});
