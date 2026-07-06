# Contributing

Thanks for helping improve JRNG UI.

## Local Setup

```bash
npm install
npm run build:lib
npm run build:docs
```

## Guidelines

- Keep components generic and reusable for Angular business and admin applications.
- Use standalone Angular components, directives, and modern Angular template syntax.
- Prefer CSS variables for theme-related styling.
- Keep public APIs stable unless a change is documented as breaking.
- Add or update focused tests when behavior changes.
- Do not add or wrap any third-party UI-component framework.
- Do not commit generated `dist` output.

## Pull Requests

Include a short summary, test/build commands run, and any migration notes for public API changes.
