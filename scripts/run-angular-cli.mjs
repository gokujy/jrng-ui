import angularCli from '@angular/cli';
import { stop as stopEsbuild } from 'esbuild';

const runCli = angularCli.default ?? angularCli;

try {
  process.exitCode =
    (await runCli({
      cliArgs: process.argv.slice(2),
    })) ?? 0;
} finally {
  stopEsbuild();
}
