import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { JBreadcrumbComponent } from './breadcrumb.component';

describe('JBreadcrumbComponent variants', () => {
  let fixture: ComponentFixture<JBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JBreadcrumbComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(JBreadcrumbComponent);
    fixture.componentRef.setInput('model', [
      { label: 'Workspace', url: '/workspace' },
      { label: 'Very long settings section' },
    ]);
  });

  it('renders contained and steps variants while preserving the current-page semantic', () => {
    fixture.componentRef.setInput('variant', 'steps');
    fixture.detectChanges();
    const root = fixture.debugElement.query(By.css('nav')).nativeElement as HTMLElement;
    expect(root.dataset['jVariant']).toBe('steps');
    expect(fixture.debugElement.query(By.css('[aria-current="page"]'))).toBeTruthy();

    fixture.componentRef.setInput('variant', 'contained');
    fixture.detectChanges();
    expect(root.classList).toContain('j-breadcrumb--contained');
  });
});
