import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JToastContainerComponent } from './toast-container.component';
import { JToastService } from './toast.service';

describe('JToastContainerComponent', () => {
  let fixture: ComponentFixture<JToastContainerComponent>;
  let service: JToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JToastContainerComponent],
    }).compileComponents();

    service = TestBed.inject(JToastService);
    service.clear();
    fixture = TestBed.createComponent(JToastContainerComponent);
    fixture.detectChanges();
  });

  it('renders multiple toasts and allows manual close', () => {
    service.success('Saved', 'Done', 0);
    service.error('Failed', 'Error', 0);
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.j-toast')).length).toBe(2);

    const close = fixture.debugElement.query(By.css('.j-toast__close'))
      .nativeElement as HTMLButtonElement;
    close.click();
    fixture.detectChanges();

    expect(service.toasts().length).toBe(1);
  });

  it('applies the configured position class', () => {
    fixture.componentRef.setInput('position', 'bottom-left');
    fixture.detectChanges();

    const stack = fixture.debugElement.query(By.css('.j-toast-stack')).nativeElement as HTMLElement;

    expect(stack.classList).toContain('j-toast-stack--bottom-left');
  });
});
