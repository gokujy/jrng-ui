import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JAvatarGroupComponent, JAvatarGroupItem } from './avatar-group.component';

describe('JAvatarGroupComponent', () => {
  let fixture: ComponentFixture<JAvatarGroupComponent>;

  const people: readonly JAvatarGroupItem[] = [
    { label: 'Avery Reed', ariaLabel: 'Avery Reed' },
    { label: 'Morgan Kim', image: '/morgan.svg' },
    { label: 'Jordan Lee' },
    { label: 'Sam Patel' },
  ];

  beforeEach(() => {
    fixture = TestBed.createComponent(JAvatarGroupComponent);
    fixture.componentRef.setInput('items', people);
    fixture.componentRef.setInput('max', 2);
    fixture.componentRef.setInput('ariaLabel', 'Assigned team');
    fixture.detectChanges();
  });

  it('renders the configured number of members and an accessible overflow count', () => {
    const items = fixture.debugElement.queryAll(By.css('.j-avatar-group__item'));
    expect(items.length).toBe(2);
    expect(items[0].nativeElement.textContent.trim()).toBe('AR');
    expect(items[1].query(By.css('img')).attributes['alt']).toBe('Morgan Kim');
    const overflow = fixture.debugElement.query(By.css('.j-avatar-group__overflow button'));
    expect(overflow.nativeElement.textContent.trim()).toContain('+2');
    expect(overflow.attributes['aria-label']).toBe('2 more');
    expect(fixture.nativeElement.querySelector('.j-avatar-group').getAttribute('aria-label')).toBe(
      'Assigned team',
    );
  });

  it('updates visible members, overflow, and size when inputs change', () => {
    fixture.componentRef.setInput('max', 4);
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.j-avatar-group__item')).length).toBe(4);
    expect(fixture.debugElement.query(By.css('[aria-label="2 more"]'))).toBeNull();
    expect(fixture.debugElement.queryAll(By.css('.j-avatar-group__item--lg')).length).toBe(4);
  });

  it('handles a zero or negative maximum without throwing', () => {
    fixture.componentRef.setInput('max', -1);
    fixture.detectChanges();
    const overflow = fixture.debugElement.query(By.css('.j-avatar-group__overflow button'));
    expect(overflow.nativeElement.textContent.trim()).toBe('+4');
    expect(overflow.attributes['aria-label']).toBe('4 more');
  });
});
