import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideJrngUI } from 'jrng-ui/core';
import { JThemeService } from 'jrng-ui/theming';
import { vi } from 'vitest';
import { MockAuthService } from '../services/mock-auth.service';
import { AdminShellComponent } from './admin-shell.component';

describe('AdminShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminShellComponent],
      providers: [provideRouter([]), provideJrngUI({ themeMode: 'light' })],
    }).compileComponents();
  });

  it('renders one navigation link per configured item', () => {
    const fixture = TestBed.createComponent(AdminShellComponent);
    fixture.detectChanges();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('.admin-nav a');
    expect(links.length).toBe(fixture.componentInstance.navigation.length);
  });

  it('toggles the collapsed sidebar signal', () => {
    const fixture = TestBed.createComponent(AdminShellComponent);
    const component = fixture.componentInstance;
    expect(component.collapsed()).toBe(false);
    component.collapsed.set(true);
    expect(component.collapsed()).toBe(true);
  });

  it('switches the theme between light and dark', () => {
    const fixture = TestBed.createComponent(AdminShellComponent);
    const theme = TestBed.inject(JThemeService);
    const setMode = vi.spyOn(theme, 'setMode');
    theme.setMode('light');
    setMode.mockClear();

    fixture.componentInstance.toggleTheme();
    expect(setMode).toHaveBeenCalledWith('dark');
  });

  it('delegates sign out to the authentication service', () => {
    const fixture = TestBed.createComponent(AdminShellComponent);
    const auth = TestBed.inject(MockAuthService);
    const logout = vi.spyOn(auth, 'logout').mockResolvedValue();

    fixture.componentInstance.logout();
    expect(logout).toHaveBeenCalled();
  });
});
