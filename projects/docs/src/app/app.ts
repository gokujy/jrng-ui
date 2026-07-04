import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { JConfirmDialogComponent } from 'jrng-ui/confirm-dialog';
import { JrToastContainerComponent } from 'jrng-ui/toast';

interface ShowcaseNavItem {
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, JConfirmDialogComponent, JrToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly primaryNav: readonly ShowcaseNavItem[] = [
    { label: 'Introduction', path: '/introduction' },
    { label: 'Theme', path: '/theme' },
    { label: 'Button', path: '/button' },
    { label: 'Inputs', path: '/inputs' },
    { label: 'Select', path: '/select' },
    { label: 'Selection', path: '/selection' },
    { label: 'DatePicker', path: '/date-picker' },
    { label: 'Dialog', path: '/dialog' },
    { label: 'Toast', path: '/toast' },
    { label: 'ConfirmDialog', path: '/confirm-dialog' },
    { label: 'Table', path: '/table' },
    { label: 'Panels', path: '/layout' },
    { label: 'FileUpload', path: '/file-upload' },
    { label: 'Accessibility', path: '/accessibility' },
    { label: 'Migration', path: '/migration' },
  ];
}
