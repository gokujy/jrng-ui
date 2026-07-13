import { TestBed } from '@angular/core/testing';
import { MockAdminApiService } from '../services/mock-admin-api.service';
import { DashboardPage } from './dashboard.page';

describe('DashboardPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DashboardPage] });
  });

  it('exposes the recent-users table columns', () => {
    const component = TestBed.createComponent(DashboardPage).componentInstance;
    expect(component.columns.map((column) => column.field)).toEqual([
      'name',
      'email',
      'role',
      'status',
    ]);
  });

  it('provides weekly chart data aligned with day labels', () => {
    const component = TestBed.createComponent(DashboardPage).componentInstance;
    expect(component.chartData.labels.length).toBe(7);
    expect(component.chartData.datasets[0].data.length).toBe(7);
  });

  it('reads live metrics and users from the mock api', () => {
    const component = TestBed.createComponent(DashboardPage).componentInstance;
    const api = TestBed.inject(MockAdminApiService);
    expect(component.api.metrics.length).toBe(4);
    expect(component.api.users().length).toBe(api.users().length);
  });
});
