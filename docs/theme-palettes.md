# Theme palette customization

Primary and surface palettes are optional resolver layers supported by Default,
Material, and Nexus. Preset values resolve first, palette values resolve second,
and explicit semantic/component overrides resolve last.

## Built-in primary palettes

JRNG provides `blue`, `indigo`, `violet`, `emerald`, `teal`, `orange`, and
`rose`. Each scale contains steps 50 through 950 and derives primary, hover,
active, soft, foreground, focus-ring, and selection semantics for both schemes.

```ts
provideJrngTheme({
  preset: 'default',
  primary: 'emerald',
});

provideJrngTheme({
  preset: 'material',
  primary: 'violet',
});

provideJrngTheme({
  preset: 'nexus',
  primary: 'teal',
});
```

## Custom primary scale

```ts
provideJrngTheme({
  preset: 'default',
  primary: {
    50: '#effaf8',
    200: '#a8e5da',
    300: '#72cdbc',
    400: '#42af9d',
    500: '#258f7e',
    600: '#187464',
    700: '#155d51',
    800: '#164a42',
    900: '#153e37',
    950: '#09231f',
  },
});
```

Missing or empty steps inherit from JRNG Indigo, so resolution remains
deterministic. Light uses 600/700/800/50 for primary relationships; dark uses
400/300/200/900. An explicit semantic override can replace any derived value.

## Surface palettes

Built-in surface directions are `cool`, `neutral`, and `warm`. Each maps
ground, section, card, overlay, border, strong border, muted, hover, and selected
roles separately in light and dark.

```ts
provideJrngTheme({
  preset: 'nexus',
  surface: 'neutral',
});
```

## Custom surface mapping

```ts
provideJrngTheme({
  preset: 'material',
  surface: {
    light: {
      ground: '#f7f8fa',
      section: '#eef1f4',
      card: '#ffffff',
      overlay: '#ffffff',
      border: '#d3dae3',
      borderStrong: '#adb8c5',
      muted: '#eef1f4',
      hover: '#e8edf2',
      selected: '#e0e8f1',
    },
    dark: {
      ground: '#10151b',
      section: '#17202a',
      card: '#151d26',
      overlay: '#1c2732',
      border: '#31404f',
      borderStrong: '#4d6070',
      muted: '#202c38',
      hover: '#293744',
      selected: '#2e4050',
    },
  },
});
```

Partial custom surface mappings change only supplied roles. This allows a
controlled surface adjustment without breaking foreground and state semantics.

## Runtime, scheme, scope, and reset

```ts
const theme = inject(JThemeService);

theme.setPrimaryPalette('rose');
theme.setSurfacePalette('warm');
theme.setColorScheme('dark');

const preview = theme.createScope(element, {
  preset: 'nexus',
  primary: 'orange',
  surface: 'neutral',
  colorScheme: 'system',
});

theme.reset();
preview.destroy();
```

Runtime changes require no reload. Scoped palettes do not modify the document
theme. `reset()` restores provider values. SSR `getInitialState()` resolves the
same deterministic palette variables as the browser. Persistence remains an
application responsibility.

## Override priority

1. Preset primitive, semantic, and component values
2. Surface palette
3. Primary palette
4. `tokens` semantic/foundation overrides
5. `components` overrides

Components continue to consume semantic values rather than palette steps
directly, preserving contrast relationships and cross-preset behaviour.
