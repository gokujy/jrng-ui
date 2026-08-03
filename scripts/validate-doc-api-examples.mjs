import { readCoverageModel } from './doc-api-example-coverage.mjs';
import { ACTIVE_COMPONENT_TOTAL } from './component-categories.mjs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const coverage = await readCoverageModel(process.cwd());
const categoryArgument = process.argv.find((argument) => argument.startsWith('--category='));
const requestedCategory = categoryArgument?.slice('--category='.length);
const components = requestedCategory
  ? coverage.components.filter((component) => component.category === requestedCategory)
  : coverage.components;
const failures = [];
const exampleKeys = new Set();
const previewRouterSource = await readFile(
  resolve(
    process.cwd(),
    'projects/docs/src/app/docs/component-detail-previews/component-preview.component.ts',
  ),
  'utf8',
);
const apiPreviewSource = await readFile(
  resolve(
    process.cwd(),
    'projects/docs/src/app/docs/component-detail-previews/api-example-preview.component.ts',
  ),
  'utf8',
);

if (
  !previewRouterSource.includes("previewExample().key.startsWith('api-')") ||
  !previewRouterSource.includes('<app-api-example-preview')
) {
  failures.push('API examples are not routed to the runnable API preview host.');
}
if (!apiPreviewSource.includes('host.createComponent(componentType')) {
  failures.push('API preview host does not create the documented public component.');
}

if (requestedCategory && !components.length) {
  failures.push(`Unknown or empty documentation category: ${requestedCategory}.`);
}

for (const component of components) {
  const mappedInputs = new Set(component.examples.flatMap((example) => example.inputs));
  const mappedOutputs = new Set(component.examples.flatMap((example) => example.outputs));
  const mappedMethods = new Set(component.examples.flatMap((example) => example.methods));
  const mappedTemplates = new Set(component.examples.flatMap((example) => example.templates));
  const excluded = new Set(component.exclusions.map((entry) => entry.api));

  for (const input of component.inputs) {
    if (!mappedInputs.has(input) && !excluded.has(input)) {
      failures.push(`${component.selector}: input ${input} has no runnable example or exclusion.`);
    }
  }
  for (const output of component.outputs) {
    if (!mappedOutputs.has(output) && !excluded.has(output)) {
      failures.push(
        `${component.selector}: output ${output} has no runnable example or exclusion.`,
      );
    }
  }
  for (const method of component.methods) {
    if (!mappedMethods.has(method) && !excluded.has(method)) {
      failures.push(
        `${component.selector}: method ${method} has no runnable example or exclusion.`,
      );
    }
  }
  for (const template of component.templates) {
    if (!mappedTemplates.has(template) && !excluded.has(template)) {
      failures.push(`${component.selector}: template ${template} has no runnable example.`);
    }
  }
  if (component.forms === 'ControlValueAccessor') {
    const forms = new Set(component.examples.flatMap((example) => example.forms));
    for (const contract of ['reactive', 'template-driven', 'disabled', 'validation', 'reset']) {
      if (!forms.has(contract)) {
        failures.push(`${component.selector}: forms example is missing ${contract} coverage.`);
      }
    }
  }
  for (const example of component.examples) {
    const globalKey = `${component.selector}:${example.key}`;
    if (exampleKeys.has(globalKey)) failures.push(`${globalKey}: duplicate example ID.`);
    exampleKeys.add(globalKey);
    if (!example.html.includes(`<${component.selector}`)) {
      failures.push(`${globalKey}: displayed HTML does not use the public selector.`);
    }
    const documentedInputs = new Set(
      [...example.html.matchAll(/\[([A-Za-z_$][\w$-]*)\]=/g)].map((match) => match[1]),
    );
    const documentedOutputs = new Set(
      [...example.html.matchAll(/\(([A-Za-z_$][\w$-]*)\)=/g)].map((match) => match[1]),
    );
    for (const input of example.inputs) {
      if (!documentedInputs.has(input)) {
        failures.push(`${globalKey}: input ${input} is mapped but absent from displayed HTML.`);
      }
    }
    for (const output of example.outputs) {
      if (!documentedOutputs.has(output)) {
        failures.push(`${globalKey}: output ${output} is mapped but absent from displayed HTML.`);
      }
    }
    if (example.outputs.length && !example.html.includes('role="status"')) {
      failures.push(`${globalKey}: event example has no visible result log.`);
    }
    if (
      example.outputs.length &&
      (!example.ts.includes('recordEvent(') || !example.ts.includes('lastEvent'))
    ) {
      failures.push(`${globalKey}: event source is missing its handler or visible state.`);
    }
    if (
      example.forms.length &&
      (!example.html.includes('[formGroup]') ||
        !example.html.includes('[(ngModel)]') ||
        !example.ts.includes('Validators.required') ||
        !example.ts.includes('resetForm()'))
    ) {
      failures.push(`${globalKey}: forms source is missing a supported forms workflow.`);
    }
    if (example.methods.length && !example.html.includes('(onClick)=')) {
      failures.push(`${globalKey}: method example has no runnable JRNG action.`);
    }
    if (example.templates.length) {
      for (const template of example.templates) {
        const attribute = template.match(/\[([^\]]+)\]/)?.[1] ?? template;
        if (!example.html.includes(attribute)) {
          failures.push(`${globalKey}: template ${template} is absent from displayed HTML.`);
        }
      }
    }
  }
  for (const exclusion of component.exclusions) {
    if (!exclusion.reason.trim()) {
      failures.push(`${component.selector}: exclusion ${exclusion.api} has no reason.`);
    }
  }
}

if (!requestedCategory && coverage.summary.totalPublicComponents !== ACTIVE_COMPONENT_TOTAL) {
  failures.push(
    `Expected ${ACTIVE_COMPONENT_TOTAL} public components; found ${coverage.summary.totalPublicComponents}.`,
  );
}
if (
  !requestedCategory &&
  coverage.summary.completeComponents !== coverage.summary.totalPublicComponents
) {
  failures.push('Not every public component is marked Complete.');
}

if (failures.length) {
  console.error(`Documentation API-example validation failed:\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(
    requestedCategory
      ? `Validated ${components.length} ${requestedCategory} components and their API examples.`
      : `Validated ${coverage.summary.totalPublicComponents} components, ${coverage.summary.publicInputs} inputs, ${coverage.summary.publicOutputs} outputs, and ${coverage.summary.registryMethods} registry methods.`,
  );
}
