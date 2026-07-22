# Package content audit

Verdict: **PASS**

The package allowlist contains compiled FESM output, declarations, CSS/theme assets, public metadata, README, changelog, license, and required package manifests. The existing package verifier rejects source maps, tests, applications, audit drafts, AI instructions, local paths, archives, credentials, caches, and unexpected files. Strict import verification runs against the packed artifact.

Current budgets are 315 files, 460,000 packed bytes, and 3,300,000 unpacked bytes. Exact final values are recorded by `npm run verify:package` during release validation.
