# JRNG UI

A modern, premium Angular UI component library for building clean, fast, and accessible web applications.

## Install

```bash
npm install jrng-ui
```

## Usage

Import standalone components from secondary entrypoints.

```ts
import { JButtonComponent } from 'jrng-ui/button';
import { JInputComponent } from 'jrng-ui/input';
```

```html
<j-button label="Save"></j-button>
<j-input label="Email" placeholder="Enter email"></j-input>
```

## Styles

Add JRNG UI styles once in your global stylesheet.

```scss
@use 'jrng-ui/styles';
```

If you prefer configuring global styles in `angular.json`, include the compiled CSS file.

```json
{
  "styles": ["node_modules/jrng-ui/theme/jrng-ui.css", "src/styles.scss"]
}
```

## Documentation

Full documentation, examples, theming guides, and component APIs are available at:

https://jrngui.dev/

## Features

- Modern Angular standalone components
- `j-*` component selectors
- Premium dashboard-friendly design
- Light and dark theme support
- Design tokens
- Accessibility-focused patterns
- Reactive Forms support
- SSR-safe implementation
- Zoneless-friendly behavior
- Secondary entrypoints

## License

MIT
