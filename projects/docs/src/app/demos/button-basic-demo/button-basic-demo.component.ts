import { Component } from '@angular/core';
import { JrButtonComponent } from 'jrng-ui/button';

@Component({
  selector: 'app-button-basic-demo',
  imports: [JrButtonComponent],
  templateUrl: './button-basic-demo.component.html',
  styleUrl: './button-basic-demo.component.scss',
})
export class ButtonBasicDemoComponent {
  saved = false;
  save(): void {
    this.saved = true;
  }
}
