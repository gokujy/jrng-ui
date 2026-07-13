import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { JConfirmationService } from 'jrng-ui/confirm-dialog';
import { JrToastService } from 'jrng-ui/toast';
import { vi } from 'vitest';
import { MockAdminApiService } from '../services/mock-admin-api.service';
import { UsersPage } from './users.page';

describe('UsersPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the user table while users exist', () => {
    const fixture = TestBed.createComponent(UsersPage);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('j-table')).toBeTruthy();
    expect(host.querySelector('j-empty-state')).toBeNull();
  });

  it('renders the empty state when there are no users', () => {
    const fixture = TestBed.createComponent(UsersPage);
    TestBed.inject(MockAdminApiService).users.set([]);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('j-empty-state')).toBeTruthy();
    expect(host.querySelector('j-table')).toBeNull();
  });

  it('confirms removal, then deletes the user and raises a toast on accept', () => {
    const fixture = TestBed.createComponent(UsersPage);
    const component = fixture.componentInstance;
    const api = TestBed.inject(MockAdminApiService);
    const confirmation = TestBed.inject(JConfirmationService);
    const toast = TestBed.inject(JrToastService);
    const confirmSpy = vi.spyOn(confirmation, 'confirm');
    const successSpy = vi.spyOn(toast, 'success');

    const target = api.users()[0];
    component.confirmRemove();

    const options = confirmSpy.mock.calls[0]?.[0];
    expect(options?.header).toBe('Remove user?');
    expect(api.users().some((user) => user.id === target.id)).toBe(true);

    options?.accept?.();
    expect(api.users().some((user) => user.id === target.id)).toBe(false);
    expect(successSpy).toHaveBeenCalled();
  });
});
