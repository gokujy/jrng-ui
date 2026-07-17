import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTextExpandComponent } from './text-expand.component';

@Component({
  imports: [JTextExpandComponent],
  template: `<j-text-expand
    [text]="text"
    [collapsedLength]="length"
    [showMoreLabel]="more"
    [showLessLabel]="less"
    [(expanded)]="expanded"
    (toggle)="toggles.push($event)"
  />`,
})
class HostComponent {
  text: string | null | undefined =
    'A practical description with enough words to require expansion.';
  length = 24;
  more = 'Read full description';
  less = 'Collapse description';
  expanded = false;
  toggles: boolean[] = [];
}

describe('JTextExpandComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('preserves word boundaries and shows an accessible toggle for long text', () => {
    const content = fixture.debugElement.query(By.css('.j-text-expand__content')).nativeElement;
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(content.textContent.trim()).toBe('A practical description…');
    expect(button.textContent.trim()).toBe('Read full description');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe(content.id);
  });

  it('expands, collapses, updates two-way state, and emits toggle', () => {
    let button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.expanded).toBe(true);
    expect(fixture.componentInstance.toggles).toEqual([true]);
    expect(fixture.nativeElement.textContent).toContain('enough words to require expansion');
    button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.textContent.trim()).toBe('Collapse description');
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('does not show a toggle for short, empty, null, or undefined text', () => {
    for (const value of ['Short text', '', null, undefined]) {
      fixture.componentInstance.text = value;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('button'))).toBeNull();
    }
  });

  it('recalculates when text changes and supports exact character splitting', () => {
    fixture.componentInstance.text = 'Updated dynamic content';
    fixture.componentInstance.length = 7;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.j-text-expand__content').textContent.trim()).toBe(
      'Updated…',
    );
  });

  it('recalculates line overflow after responsive layout changes', () => {
    const lineFixture = TestBed.createComponent(JTextExpandComponent);
    lineFixture.componentRef.setInput('mode', 'lines');
    lineFixture.componentRef.setInput('text', 'A line-based description that can wrap.');
    lineFixture.detectChanges();
    const content = lineFixture.nativeElement.querySelector('.j-text-expand__content');
    Object.defineProperty(content, 'clientHeight', { configurable: true, value: 40 });
    Object.defineProperty(content, 'scrollHeight', { configurable: true, value: 80 });
    lineFixture.componentInstance.recalculate();
    lineFixture.detectChanges();
    expect(lineFixture.componentInstance.lineOverflow()).toBe(true);
    expect(lineFixture.debugElement.query(By.css('button'))).not.toBeNull();

    Object.defineProperty(content, 'scrollHeight', { configurable: true, value: 40 });
    lineFixture.componentInstance.recalculate();
    lineFixture.detectChanges();
    expect(lineFixture.componentInstance.lineOverflow()).toBe(false);
    expect(lineFixture.debugElement.query(By.css('button'))).toBeNull();
  });
});
