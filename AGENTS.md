# JRNG UI contribution instructions

Use these rules when generating or modifying code in this repository:

- Keep the package name `jrng-ui`.
- Use standalone Angular components and modern Angular control flow.
- Use `j-` selectors and `.j-*` library CSS classes.
- Import public APIs from modular `jrng-ui/*` entrypoints.
- Use `(onClick)` for JRNG UI button activation.
- Preserve public API compatibility unless an intentional migration is documented.
- Guard direct browser APIs for SSR and use explicit state updates compatible with zoneless Angular.
- Maintain keyboard navigation, visible focus, ARIA naming, reduced motion, disabled behavior, and semantic theme contrast.
- Prefer existing JRNG UI controls over custom replacements in examples and the admin starter.
- Keep examples generic and free of private data.
- Do not publish or deploy from an automated contribution task.
- Do not place this file, prompts, temporary files, tests, coverage, development notes, or private documents in the npm package.

Before handoff, run the focused tests, type checking, builds, registry verification, and package dry run appropriate to the change.
