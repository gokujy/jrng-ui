import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JLoaderComponent } from './loader.component';

describe('JLoaderComponent', () => {
  let fixture: ComponentFixture<JLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [JLoaderComponent] }).compileComponents();
    fixture = TestBed.createComponent(JLoaderComponent);
  });

  it('renders a non-spinner dots loader by default', () => {
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.j-loader--dots'))).not.toBeNull();
    expect(fixture.debugElement.queryAll(By.css('.j-loader i'))).toHaveLength(3);
    expect(fixture.debugElement.query(By.css('.j-progress-spinner'))).toBeNull();
  });

  it('supports bars and pulse variants', () => {
    fixture.componentRef.setInput('variant', 'bars');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.j-loader--bars'))).not.toBeNull();

    fixture.componentRef.setInput('variant', 'pulse');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.j-loader--pulse'))).not.toBeNull();
    expect(fixture.debugElement.queryAll(By.css('.j-loader i'))).toHaveLength(1);
  });
});
