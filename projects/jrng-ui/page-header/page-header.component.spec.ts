import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JPageHeaderComponent } from './page-header.component';

describe('JPageHeaderComponent variants', () => {
  let fixture: ComponentFixture<JPageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [JPageHeaderComponent] }).compileComponents();
    fixture = TestBed.createComponent(JPageHeaderComponent);
    fixture.componentRef.setInput('title', 'Customer account');
    fixture.componentRef.setInput('subtitle', 'A deliberately long description that may wrap.');
  });

  it('renders stacked and centered hierarchy presets with the same heading', () => {
    fixture.componentRef.setInput('variant', 'stacked');
    fixture.detectChanges();
    const root = fixture.debugElement.query(By.css('header')).nativeElement as HTMLElement;
    expect(root.classList).toContain('j-page-header--stacked');
    expect(root.querySelector('h1')?.textContent).toContain('Customer account');

    fixture.componentRef.setInput('variant', 'centered');
    fixture.detectChanges();
    expect(root.dataset['jVariant']).toBe('centered');
  });
});
