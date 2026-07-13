import { TestBed } from '@angular/core/testing';
import { JrToastService } from 'jrng-ui/toast';
import { vi } from 'vitest';
import { AccountPage } from './account.page';

describe('AccountPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AccountPage] }).compileComponents();
  });

  it('derives the title and description from the active page input', () => {
    const fixture = TestBed.createComponent(AccountPage);
    fixture.componentRef.setInput('page', 'settings');
    fixture.detectChanges();
    expect(fixture.componentInstance.title()).toBe('Settings');
    expect(fixture.componentInstance.description()).toContain('workspace');
  });

  it('shows the profile form for the profile page', () => {
    const fixture = TestBed.createComponent(AccountPage);
    fixture.componentRef.setInput('page', 'profile');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('form.admin-form')).toBeTruthy();
  });

  it('raises a toast when a section is saved', () => {
    const fixture = TestBed.createComponent(AccountPage);
    const success = vi.spyOn(TestBed.inject(JrToastService), 'success');
    fixture.componentInstance.save('Profile');
    expect(success).toHaveBeenCalledWith('Profile saved.', 'Saved');
  });
});
