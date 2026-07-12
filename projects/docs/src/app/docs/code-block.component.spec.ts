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
});
