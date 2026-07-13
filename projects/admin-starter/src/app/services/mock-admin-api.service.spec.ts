import { TestBed } from '@angular/core/testing';
import { AdminUser } from '../models/admin.models';
import { MockAdminApiService } from './mock-admin-api.service';

describe('MockAdminApiService', () => {
  let api: MockAdminApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    api = TestBed.inject(MockAdminApiService);
  });

  it('seeds users, metrics and activity for the reference dashboard', () => {
    expect(api.users().length).toBeGreaterThan(0);
    expect(api.metrics.length).toBe(4);
    expect(api.activity.length).toBeGreaterThan(0);
    expect(api.loading()).toBe(false);
  });

  it('appends a new user when the id is not already present', async () => {
    const before = api.users().length;
    const user: AdminUser = {
      id: 'usr-new',
      name: 'New Person',
      email: 'new@example.com',
      role: 'Analyst',
      status: 'Invited',
    };
    await api.saveUser(user);
    expect(api.users().length).toBe(before + 1);
    expect(api.users().find((item) => item.id === 'usr-new')?.name).toBe('New Person');
    expect(api.loading()).toBe(false);
  });

  it('updates an existing user in place without changing the count', async () => {
    const existing = api.users()[0];
    const before = api.users().length;
    await api.saveUser({ ...existing, name: 'Renamed Person' });
    expect(api.users().length).toBe(before);
    expect(api.users().find((item) => item.id === existing.id)?.name).toBe('Renamed Person');
  });

  it('removes a user by id', () => {
    const existing = api.users()[0];
    api.removeUser(existing.id);
    expect(api.users().some((item) => item.id === existing.id)).toBe(false);
  });
});
