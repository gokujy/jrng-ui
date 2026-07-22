# Visual regression system

The deterministic manifest covers 35 critical components. Captures must block network access, disable animation, use fixed data/timestamps and run every declared viewport/theme/state.

- npm run verify:visual-manifest validates coverage in required CI.
- Browser screenshot capture is an optional job until candidate baselines are reviewed and promoted.
- Promote baseline changes only with an intentional UI-change review, linked accessibility review, and before/after evidence.
- Never update baselines merely to make CI green.
