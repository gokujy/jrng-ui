import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JIconComponent } from 'jrng-ui/icon';
import { JIconFieldComponent } from './icon-field.component';

@Component({
  imports: [JIconFieldComponent],
  template: `<j-icon-field prefixIcon="search" suffixIcon="filter"><input /></j-icon-field>`,
})
class IconFieldHostComponent {}

describe('JIconFieldComponent', () => {
  let fixture: ComponentFixture<IconFieldHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IconFieldHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(IconFieldHostComponent);
    fixture.detectChanges();
  });

  it('renders icon components instead of icon-name text', () => {
    expect(fixture.debugElement.queryAll(By.directive(JIconComponent))).toHaveLength(2);
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});
