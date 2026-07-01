import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent, JrButtonSize, JrButtonVariant } from 'jrng-ui/button';
import { DialogComponent } from 'jrng-ui/dialog';
import { InputComponent } from 'jrng-ui/input';
import { JrToastService, ToastContainerComponent } from 'jrng-ui/toast';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    DialogComponent,
    InputComponent,
    ToastContainerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly toastService = inject(JrToastService);

  readonly buttonVariants: readonly JrButtonVariant[] = [
    'primary',
    'secondary',
    'outline',
    'ghost',
    'danger',
    'success',
  ];
  readonly buttonSizes: readonly JrButtonSize[] = ['sm', 'md', 'lg'];
  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly emailControl = new FormControl<string>('finance@jr.example', { nonNullable: true });
  readonly textareaControl = new FormControl<string>('Approve purchase order after tax review.', {
    nonNullable: true,
  });

  confirmDialogOpen = false;
  formDialogOpen = false;
  alertDialogOpen = false;

  showToast(type: 'success' | 'error' | 'warning' | 'info'): void {
    const messages = {
      success: 'Quarterly forecast was saved.',
      error: 'Invoice export failed validation.',
      warning: 'Inventory threshold is below target.',
      info: 'Approval queue synced moments ago.',
    };

    this.toastService.show({
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message: messages[type],
      duration: 4000,
    });
  }

  openConfirm(): void {
    this.confirmDialogOpen = true;
  }

  openForm(): void {
    this.formDialogOpen = true;
  }

  openAlert(): void {
    this.alertDialogOpen = true;
  }
}
