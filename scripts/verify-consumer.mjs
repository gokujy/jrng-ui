import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'jrng-ui-consumer-'));
const app = path.join(temporaryRoot, 'consumer');

try {
  run('npm', ['run', 'build:lib'], root);
  const pack = run(
    'npm',
    ['pack', path.join(root, 'dist', 'jrng-ui'), '--pack-destination', temporaryRoot],
    root,
    true,
  );
  const packageName = pack.stdout.trim().split(/\r?\n/).at(-1);
  if (!packageName) throw new Error('npm pack did not return a package filename.');
  const tarball = path.join(temporaryRoot, packageName);

  run(
    'npx',
    [
      'ng',
      'new',
      'consumer',
      '--directory',
      'consumer',
      '--standalone',
      '--routing=false',
      '--style=css',
      '--ssr',
      '--skip-git',
      '--skip-install',
      '--package-manager=npm',
      '--defaults',
    ],
    temporaryRoot,
  );
  run('npm', ['install'], app);
  run('npm', ['install', tarball], app);

  fs.writeFileSync(
    path.join(app, 'src', 'app', 'app.ts'),
    `import { Component } from '@angular/core';
import { JButtonComponent } from 'jrng-ui';
import { JEditorComponent } from 'jrng-ui/editor';
import { JInputNumberComponent } from 'jrng-ui/input-number';
import { JSelectComponent } from 'jrng-ui/select';

@Component({
  selector: 'app-root',
  imports: [JButtonComponent, JEditorComponent, JInputNumberComponent, JSelectComponent],
  template: '<j-button label="Save" /><j-input-number /><j-select [options]="[]" /><j-editor />',
})
export class App {}
`,
  );
  fs.writeFileSync(
    path.join(app, 'src', 'app', 'app.config.ts'),
    `import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideJrngUI } from 'jrng-ui/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideJrngUI({ inputStyle: 'filled', appendTo: 'body' }),
  ],
};
`,
  );
  fs.appendFileSync(path.join(app, 'src', 'styles.css'), "\n@import 'jrng-ui/styles';\n");
  run('npx', ['ng', 'build', '--configuration', 'production'], app);
  ensureOptionalPeersAbsent(app);

  run('npm', ['install', 'chart.js@^4.5.1'], app);
  fs.writeFileSync(
    path.join(app, 'src', 'app', 'app.ts'),
    `import { Component, inject } from '@angular/core';
import { JChartComponent } from 'jrng-ui/chart';
import { JTourService } from 'jrng-ui/tour';

@Component({
  selector: 'app-root',
  imports: [JChartComponent],
  template: '<j-chart type="bar" [data]="data" />',
})
export class App {
  private readonly tour = inject(JTourService);
  readonly data = { labels: ['A'], datasets: [{ data: [1] }] };
  constructor() { void this.tour; }
}
`,
  );
  run('npx', ['ng', 'build', '--configuration', 'production'], app);
  console.log(
    'Clean Angular consumer verified with SSR, direct entrypoints, styles, and optional peers.',
  );
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

function ensureOptionalPeersAbsent(directory) {
  for (const dependency of ['chart.js']) {
    if (fs.existsSync(path.join(directory, 'node_modules', dependency))) {
      throw new Error(`${dependency} was installed before the optional integration check.`);
    }
  }
}

function run(command, args, cwd, capture = false) {
  const npmCli = process.env.npm_execpath;
  const usesNodeCli = (command === 'npm' || command === 'npx') && npmCli;
  const executable = usesNodeCli ? process.execPath : command;
  const cliArgs =
    command === 'npx'
      ? [npmCli, 'exec', '--yes', '--package=@angular/cli@21.2.17', '--', ...args]
      : command === 'npm' && npmCli
        ? [npmCli, ...args]
        : args;
  const result = spawnSync(executable, cliArgs, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      INIT_CWD: cwd,
      PWD: cwd,
      npm_config_local_prefix: cwd,
      NG_CLI_ANALYTICS: 'false',
    },
    stdio: capture ? 'pipe' : 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (capture) {
      process.stdout.write(result.stdout ?? '');
      process.stderr.write(result.stderr ?? '');
    }
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}.`);
  }
  return result;
}
