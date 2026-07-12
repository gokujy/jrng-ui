export interface AdminUser {
  readonly [key: string]: unknown;
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'Administrator' | 'Manager' | 'Analyst';
  readonly status: 'Active' | 'Invited' | 'Suspended';
}

export interface AdminMetric {
  readonly title: string;
  readonly value: string;
  readonly trend: string;
}
export interface ActivityRecord {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly occurredAt: string;
}
