# JRNG UI

[![npm version](https://img.shields.io/npm/v/jrng-ui.svg)](https://www.npmjs.com/package/jrng-ui)
[![npm downloads](https://img.shields.io/npm/dm/jrng-ui.svg)](https://www.npmjs.com/package/jrng-ui)
[![license](https://img.shields.io/npm/l/jrng-ui.svg)](LICENSE)

JRNG UI is a standalone Angular component library for business and admin applications.

## Install

```bash
npm install jrng-ui
```

## Quick Start

```ts
import { Component } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [JButtonComponent],
  template: `<j-button label="Save" (onClick)="save()"></j-button>`,
})
export class ExampleComponent {
  save(): void {}
}
```

## Theme Setup

```scss
@use 'jrng-ui/styles';
```

Or include the compiled CSS in `angular.json`.

```json
{
  "styles": ["node_modules/jrng-ui/theme/jrng-ui.css", "src/styles.scss"]
}
```

## Features

- Standalone Angular components and directives
- Secondary entrypoints for focused imports
- Forms, buttons, overlays, feedback, navigation, business utilities, and data table components
- Optional Tour Guide wrapper through `JTourService` and `jTourStep` for apps that install `driver.js`
- Token-driven light and dark themes
- CSS variables for customization
- Accessibility-focused interaction states

## Links

- Docs: https://jrngui.dev/
- GitHub: https://github.com/gokujy/jrng-ui
- npm: https://www.npmjs.com/package/jrng-ui

## License

MIT
