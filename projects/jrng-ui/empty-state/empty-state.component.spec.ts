import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JEmptyStateComponent } from './empty-state.component';

describe('JEmptyStateComponent variants', () => {
  let fixture: ComponentFixture<JEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [JEmptyStateComponent] }).compileComponents();
    fixture = TestBed.createComponent(JEmptyStateComponent);
    fixture.componentRef.setInput('title', 'No invoices');
    fixture.componentRef.setInput(
      'description',
      'Invoices created for this account will appear here.',
    );
  });

  it('renders inline and panel layouts without changing content hierarchy', () => {
    fixture.componentRef.setInput('variant', 'inline');
    fixture.detectChanges();
    const root = fixture.debugElement.query(By.css('section')).nativeElement as HTMLElement;
    expect(root.classList).toContain('j-empty-state--inline');
    expect(root.querySelector('h3')?.textContent).toContain('No invoices');

    fixture.componentRef.setInput('variant', 'panel');
    fixture.detectChanges();
    expect(root.dataset['jVariant']).toBe('panel');
  });
});
