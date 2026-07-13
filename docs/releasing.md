# Release Validation

JRNG UI releases are created from the built `dist/jrng-ui` package. Never pack or publish the private workspace root.

## Prerequisites

- Use a Node.js version supported by `projects/jrng-ui/package.json`.
- Install dependencies with `npm install` or `npm ci`.
- Ensure the workspace and library versions match.
- Add an accurate changelog entry for the release version.
- Commit or stash all changes before the final release check.

If the project adopts named release branches, configure the comma-separated `JRNG_RELEASE_BRANCHES` environment variable. The release verifier enforces it when present.

## Validate the package

Run the package verifier during development:

```bash
npm run verify:package
npm run verify:api
```

This builds the library, runs an npm pack dry run against `dist/jrng-ui`, validates package metadata and exports, checks the file allowlist, scans for private content and development paths, enforces size budgets, and confirms required documentation, license, types, styles, and themes are present.

After a library build, `verify:api` strictly compiles a consumer that imports every generated public entry point plus representative compatibility exports.

To print every included package file after a successful build:

```bash
npm run verify:package -- --skip-build --list
```

Additional private terms can be supplied through the comma-separated `JRNG_ADDITIONAL_FORBIDDEN_TERMS` environment variable without committing those terms to the repository.

## Run the release gate

The final release command is:

```bash
npm run release:check
```

It requires a clean Git working tree and runs lint, tests, the library build, the documentation build, version and changelog checks, public-source privacy checks, export validation, and package verification. It never publishes.

For local development only, the same checks can be exercised before committing:

```bash
npm run verify:release -- --allow-dirty
```

Do not use `--allow-dirty` for the real release.

## Inspect or create the tarball

Inspect the package without creating a tarball:

```bash
npm run pack:dry-run
```

Create the tarball in the workspace root:

```bash
npm run pack:lib
```

The command packs `dist/jrng-ui`, not the private workspace package. Confirm the reported package name and version before continuing.

## Test in another Angular project

From a clean Angular application, install the generated tarball using its relative path:

```bash
npm install ../jrng-ui/jrng-ui-0.0.9.tgz
ng build --configuration production
```

Import components only through public package entrypoints and verify global styles, themes, Angular forms, and overlay behavior. Do not use workspace source aliases or deep source imports.

## Publish manually

After the clean release check and consumer test pass:

```bash
npm whoami
npm publish ./jrng-ui-0.0.9.tgz --access public
```

Publishing is intentionally manual. Recheck the tarball name, version, npm account, tag, and changelog immediately before running the publish command.
