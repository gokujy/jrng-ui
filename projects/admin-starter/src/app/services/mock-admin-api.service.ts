import { Injectable, signal } from '@angular/core';
import { ActivityRecord, AdminMetric, AdminUser } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class MockAdminApiService {
  readonly loading = signal(false);
  readonly users = signal<readonly AdminUser[]>([
    {
      id: 'usr-1001',
      name: 'Avery Morgan',
      email: 'avery@example.com',
      role: 'Administrator',
      status: 'Active',
    },
    {
      id: 'usr-1002',
      name: 'Jordan Lee',
      email: 'jordan@example.com',
      role: 'Manager',
      status: 'Active',
    },
    {
      id: 'usr-1003',
      name: 'Taylor Reed',
      email: 'taylor@example.com',
      role: 'Analyst',
      status: 'Invited',
    },
  ]);
  readonly metrics: readonly AdminMetric[] = [
    { title: 'Active users', value: '1,284', trend: '+8.4%' },
    { title: 'Open requests', value: '86', trend: '-4.1%' },
    { title: 'Completion rate', value: '94.2%', trend: '+2.3%' },
    { title: 'Median response', value: '18m', trend: '-1.8%' },
  ];
  readonly activity: readonly ActivityRecord[] = [
    {
      id: 'act-1',
      title: 'Access policy updated',
      detail: 'Administrator permissions were reviewed.',
      occurredAt: '10 minutes ago',
    },
    {
      id: 'act-2',
      title: 'Monthly report generated',
      detail: 'The operations report is ready.',
      occurredAt: '42 minutes ago',
    },
    {
      id: 'act-3',
      title: 'New user invited',
      detail: 'An analyst invitation was sent.',
      occurredAt: '2 hours ago',
    },
  ];

  async saveUser(user: AdminUser): Promise<void> {
    this.loading.set(true);
    await Promise.resolve();
    this.users.update((items) =>
      items.some((item) => item.id === user.id)
        ? items.map((item) => (item.id === user.id ? user : item))
        : [...items, user],
    );
    this.loading.set(false);
  }

  removeUser(id: string): void {
    this.users.update((items) => items.filter((item) => item.id !== id));
  }
}
