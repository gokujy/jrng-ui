import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JFloatLabelComponent } from './float-label.component';

@Component({
  imports: [JFloatLabelComponent],
  template: `<j-float-label label="Email"><input value="avery@example.com" /></j-float-label>`,
})
class FloatLabelHostComponent {}

describe('JFloatLabelComponent', () => {
  let fixture: ComponentFixture<FloatLabelHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatLabelHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(FloatLabelHostComponent);
  });

  it('floats immediately for an initially populated control', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.j-float-label.is-filled'))).not.toBeNull();
  });
});
