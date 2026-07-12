# Manual GitHub release checklist

This checklist validates a release; it does not publish the npm package.

## Before validation

- [ ] Choose the intended semantic version.
- [ ] Confirm workspace and library package versions match.
- [ ] Confirm the changelog has Added, Changed, Fixed, Deprecated, Removed, Security, and Migration notes sections.
- [ ] Review public API changes and migration guidance.
- [ ] Confirm Angular compatibility claims match CI evidence.

## Validate

- [ ] `npm ci`
- [ ] `npm run build:clean`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run verify:api`
- [ ] `npm run verify:registry`
- [ ] `npm run verify:docs-registry`
- [ ] `npm run verify:package -- --skip-build --list`
- [ ] `npm run pack:dry-run`
- [ ] Inspect package contents for private, temporary, test, source-map, prompt, instruction, and development-note files.
- [ ] Install the dry-run tarball in a clean Angular 21.2 application and compile representative imports.

## GitHub release

- [ ] Create a release from the signed version tag.
- [ ] Use the changelog entry as release notes.
- [ ] Link migration notes and compatibility requirements.
- [ ] Attach no workspace archives, environment files, or internal artifacts.
- [ ] Verify documentation links after release.

Publishing to npm is a separate, explicitly authorized maintainer action and is intentionally not part of this checklist automation.
