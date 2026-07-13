import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminStarterApp } from './app.component';

describe('AdminStarterApp', () => {
  it('creates the root component with routed content plus toast and confirm-dialog outlets', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStarterApp],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminStarterApp);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance).toBeTruthy();
    expect(host.querySelector('router-outlet')).toBeTruthy();
    expect(host.querySelector('j-toast')).toBeTruthy();
    expect(host.querySelector('j-confirm-dialog')).toBeTruthy();
  });
});
