# Contributing to JRNG UI

Thanks for helping improve JRNG UI. Contributions should solve reusable Angular application problems and preserve backward compatibility wherever possible.

## Local setup

Requirements:

- Node.js 22.12 or another version allowed by `engines`;
- npm 11;
- Angular 21.2.x for the verified compatibility workflow.

```bash
npm install
npm run typecheck
npm run build:lib
npm run build:docs:app
```

## Development commands

| Command                                  | Purpose                                                        |
| ---------------------------------------- | -------------------------------------------------------------- |
| `npm start`                              | Build the library and serve documentation locally              |
| `npm run build:clean`                    | Remove generated output and build library plus documentation   |
| `npm run build:lib`                      | Build the publishable Angular library                          |
| `npm run build:docs:app`                 | Build documentation against the current library output         |
| `npm run typecheck`                      | Type-check library and documentation projects                  |
| `npm run test`                           | Run library and documentation tests                            |
| `npm run verify:registry`                | Verify every public item is registered                         |
| `npm run verify:package`                 | Inspect package metadata, contents, privacy, exports, and size |
| `npm run pack:dry-run`                   | Produce npm's package-content report without publishing        |
| `npm run release:check -- --allow-dirty` | Run full local release validation without publishing           |

## Component guidelines

- Use standalone Angular components and modern control flow.
- Keep selectors under `j-` and component classes under `.j-*`.
- Keep `(onClick)` as the standard button activation output.
- Prefer signals and explicit state transitions that work without Zone.js.
- Guard browser APIs for SSR.
- Preserve keyboard behavior, focus visibility, ARIA relationships, reduced motion, disabled states, and color contrast.
- Use theme variables instead of application-specific values.
- Import public dependencies from their secondary `jrng-ui/*` entrypoints.
- Do not wrap another UI-component framework.

## Tests and documentation

Add focused tests for behavior changes. Public API changes require documentation, examples, registry metadata, changelog entries, and migration notes when applicable. Examples must be generic and executable with published package imports.

## Pull requests

Keep pull requests focused. Complete the pull request template, include commands run, and call out public API, accessibility, SSR, zoneless, responsive, and migration impact.

Do not commit `dist`, coverage, test output, temporary files, private documents, internal prompts, or development instruction files into package assets.
