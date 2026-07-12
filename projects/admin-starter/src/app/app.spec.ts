import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AdminStarterApp } from './app.component';
import { routes } from './app.routes';
import { MockAuthService } from './services/mock-auth.service';
import { vi } from 'vitest';
import { authGuard } from './guards/auth.guard';

describe('Admin Starter', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [AdminStarterApp],
      providers: [provideRouter(routes)],
    }),
  );

  it('defines lazy protected application routes and public authentication routes', () => {
    expect(routes.find((route) => route.path === 'login')?.loadComponent).toBeTypeOf('function');
    const protectedRoute = routes.find((route) => route.path === '');
    expect(protectedRoute?.canActivate?.length).toBe(1);
    expect(
      protectedRoute?.children?.every((route) => Boolean(route.loadComponent || route.redirectTo)),
    ).toBe(true);
  });

  it('mock authentication requires valid credentials and updates state', async () => {
    const auth = TestBed.inject(MockAuthService);
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    expect(await auth.login('', 'short')).toBe(false);
    expect(auth.isAuthenticated()).toBe(false);
    expect(await auth.login('admin@example.com', 'password1')).toBe(true);
    expect(auth.isAuthenticated()).toBe(true);
  });

  it('route guard redirects signed-out users and permits authenticated users', async () => {
    const auth = TestBed.inject(MockAuthService);
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const runGuard = () =>
      TestBed.runInInjectionContext(() =>
        authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      );
    expect(runGuard()).toBeInstanceOf(UrlTree);
    await auth.login('admin@example.com', 'password1');
    expect(runGuard()).toBe(true);
  });
});
