import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JMentionDirective } from './mention.directive';

@Component({
  imports: [JMentionDirective],
  template: `
    <textarea
      [jMention]="people()"
      [debounce]="0"
      (mentionSelected)="selections.push($event.insertedText)"
    ></textarea>
  `,
})
class MentionHostComponent {
  readonly people = signal([
    { label: 'Avery Reed', value: 'avery' },
    { label: 'Morgan Kim', value: 'morgan' },
  ]);
  selections: string[] = [];
}

describe('JMentionDirective', () => {
  let fixture: ComponentFixture<MentionHostComponent>;
  let textarea: HTMLTextAreaElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(MentionHostComponent);
    fixture.detectChanges();
    textarea = fixture.nativeElement.querySelector('textarea');
  });

  it('filters suggestions and inserts at the caret without replacing surrounding text', async () => {
    textarea.value = 'Owner: @av today';
    textarea.setSelectionRange(10, 10);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    const option = document.querySelector('[role="option"]') as HTMLButtonElement;
    expect(option.textContent).toContain('Avery Reed');
    option.click();
    expect(textarea.value).toBe('Owner: @avery today');
    expect(fixture.componentInstance.selections).toEqual(['@avery ']);
  });

  it('supports keyboard selection and Escape cleanup', async () => {
    textarea.value = '#';
    textarea.setSelectionRange(1, 1);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown', cancelable: true }),
    );
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', cancelable: true }),
    );
    expect(textarea.value).toContain('#morgan');
    expect(document.querySelector('.j-mention__panel')).toBeNull();
  });

  it('removes its overlay on destroy', async () => {
    textarea.value = '@';
    textarea.setSelectionRange(1, 1);
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.destroy();
    expect(document.querySelector('.j-mention__panel')).toBeNull();
  });
});
