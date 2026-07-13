import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { JrToastService } from 'jrng-ui/toast';
import { vi } from 'vitest';
import { MockAdminApiService } from '../services/mock-admin-api.service';
import { UserFormPage } from './user-form.page';

describe('UserFormPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('blocks saving while the form is invalid', async () => {
    const fixture = TestBed.createComponent(UserFormPage);
    const component = fixture.componentInstance;
    const saveUser = vi.spyOn(TestBed.inject(MockAdminApiService), 'saveUser');

    await component.save();

    expect(component.submitted()).toBe(true);
    expect(component.form.invalid).toBe(true);
    expect(saveUser).not.toHaveBeenCalled();
  });

  it('saves a valid user, notifies and navigates back to the list', async () => {
    const fixture = TestBed.createComponent(UserFormPage);
    const component = fixture.componentInstance;
    const api = TestBed.inject(MockAdminApiService);
    const toast = TestBed.inject(JrToastService);
    const router = TestBed.inject(Router);
    const saveUser = vi.spyOn(api, 'saveUser').mockResolvedValue();
    const success = vi.spyOn(toast, 'success');
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    component.form.setValue({
      name: 'Casey Blue',
      email: 'casey@example.com',
      role: 'Manager',
      status: 'Active',
    });
    await component.save();

    expect(saveUser).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Casey Blue', email: 'casey@example.com' }),
    );
    expect(success).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/users');
  });

  it('patches the form from an existing user when an id is provided', () => {
    const fixture = TestBed.createComponent(UserFormPage);
    const api = TestBed.inject(MockAdminApiService);
    const existing = api.users()[0];

    fixture.componentRef.setInput('id', existing.id);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.name.value).toBe(existing.name);
    expect(fixture.componentInstance.form.controls.email.value).toBe(existing.email);
  });
});
