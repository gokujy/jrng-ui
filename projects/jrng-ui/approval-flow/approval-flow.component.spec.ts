import { TestBed } from '@angular/core/testing';
import { JApprovalFlowComponent } from './approval-flow.component';
describe('JApprovalFlowComponent', () => {
  it('renders every generic approval state accessibly', () => {
    const f = TestBed.createComponent(JApprovalFlowComponent);
    f.componentRef.setInput(
      'steps',
      ['pending', 'approved', 'rejected', 'skipped', 'cancelled'].map((status, i) => ({
        id: i,
        label: status,
        status,
      })),
    );
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('li').length).toBe(5);
    expect(f.nativeElement.querySelector('[aria-current=step]')).not.toBeNull();
  });
});
