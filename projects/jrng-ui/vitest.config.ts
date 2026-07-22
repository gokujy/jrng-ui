import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Keep full-suite runs reliable on Windows CI and development machines;
    // Angular TestBed specs are memory-heavy when every file starts a fork.
    pool: 'forks',
    minWorkers: 1,
    maxWorkers: 4,
  },
});
