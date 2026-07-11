# JRNG UI

[![npm version](https://img.shields.io/npm/v/jrng-ui.svg)](https://www.npmjs.com/package/jrng-ui)
[![npm downloads](https://img.shields.io/npm/dm/jrng-ui.svg)](https://www.npmjs.com/package/jrng-ui)
[![license](https://img.shields.io/npm/l/jrng-ui.svg)](LICENSE)

JRNG UI is a standalone Angular component library for business and admin applications.

Version 0.0.8 supports Angular 21.2 and uses optional peers for charts and product tours.

## Install

```bash
npm install jrng-ui
```

## Quick Start

Import standalone components from secondary entrypoints.

```ts
import { Component } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JInputComponent } from 'jrng-ui/input';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [JButtonComponent, JInputComponent],
  template: `
    <j-input label="Email" placeholder="name@example.com"></j-input>
    <j-button label="Save" (onClick)="save()"></j-button>
  `,
})
export class ExampleComponent {
  save(): void {}
}
```

## Theme Setup

Add JRNG UI styles once in your global stylesheet.

```scss
@use 'jrng-ui/styles';
```

Or include the compiled CSS in `angular.json`.

```json
{
  "styles": ["node_modules/jrng-ui/theme/jrng-ui.css", "src/styles.scss"]
}
```

Dark mode is enabled by adding `j-dark` to a root element.

```html
<main class="j-dark">
  <j-button label="Save" (onClick)="save()"></j-button>
</main>
```

## Features

- Angular standalone components and directives
- Secondary entrypoints such as `jrng-ui/button` and `jrng-ui/input`
- Forms, buttons, overlays, feedback, navigation, business utilities, and data table components
- Typed SSR-safe utilities for clipboard, storage, breakpoints, keyboard shortcuts, timing, disclosure, and pagination
- Optional Tour Guide wrapper through `JTourService` and `jTourStep` for apps that install `driver.js`
- Token-driven light and dark themes
- CSS variables for component customization
- Accessibility-focused states, labels, keyboard behavior, and focus rings
- Reactive Forms support where form controls apply
- Optional peer dependencies for optional features

Browser APIs used by overlays, storage, charts, themes, and tours are guarded for server rendering. Optional features still require their documented browser runtime and peer dependency.

## Links

- Docs: https://jrngui.dev/
- GitHub: https://github.com/gokujy/jrng-ui
- npm: https://www.npmjs.com/package/jrng-ui
- Changelog: ./CHANGELOG.md
- v0.0.8 migration: ./docs/migration-0.0.8.md

## License

MIT
