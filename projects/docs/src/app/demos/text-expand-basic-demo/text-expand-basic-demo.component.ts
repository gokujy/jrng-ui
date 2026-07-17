import { Component } from '@angular/core';
import { JTextExpandComponent } from 'jrng-ui/text-expand';

@Component({
  selector: 'app-text-expand-basic-demo',
  imports: [JTextExpandComponent],
  templateUrl: './text-expand-basic-demo.component.html',
  styleUrl: './text-expand-basic-demo.component.scss',
})
export class TextExpandBasicDemoComponent {
  readonly description =
    'A durable task light with adjustable brightness, a compact base, and a warm reading mode for desks and bedside tables. The metal arm rotates smoothly and the controls remain easy to reach.';
}
