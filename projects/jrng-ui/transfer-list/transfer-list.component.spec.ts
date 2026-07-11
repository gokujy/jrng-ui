import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTransferListComponent } from './transfer-list.component';

@Component({
  imports: [JTransferListComponent],
  template: `<j-transfer-list [filter]="true" [source]="source" />`,
})
class TransferListHostComponent {
  source = [{ label: 'Users', value: 'users' }];
}

describe('JTransferListComponent', () => {
  let fixture: ComponentFixture<TransferListHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TransferListHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(TransferListHostComponent);
    fixture.detectChanges();
  });

  it('updates filters from typed input events without template casts', () => {
    const inputs = fixture.debugElement.queryAll(By.css('input'));
    const sourceInput = inputs[0].nativeElement as HTMLInputElement;
    const targetInput = inputs[1].nativeElement as HTMLInputElement;
    sourceInput.value = 'user';
    sourceInput.dispatchEvent(new Event('input'));
    targetInput.value = 'order';
    targetInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const component = fixture.debugElement.query(By.directive(JTransferListComponent))
      .componentInstance as JTransferListComponent;
    expect(component.sourceFilter).toBe('user');
    expect(component.targetFilter).toBe('order');
  });
});
