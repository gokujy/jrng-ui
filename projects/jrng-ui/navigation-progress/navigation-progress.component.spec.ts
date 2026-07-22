import { TestBed } from '@angular/core/testing';
import { JNavigationProgressComponent } from './navigation-progress.component';
import { JNavigationProgressService } from './navigation-progress.service';

describe('JNavigationProgressComponent', () => {
  it('renders an accessible progressbar only while an operation is visible', async () => {
    await TestBed.configureTestingModule({
      imports: [JNavigationProgressComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(JNavigationProgressComponent);
    const progress = TestBed.inject(JNavigationProgressService);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="progressbar"]')).toBeNull();

    progress.delay.set(0);
    progress.start('fixture');
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="progressbar"]')).not.toBeNull();
    });
    progress.complete();
  });
});
