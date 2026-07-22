import { componentDocs } from './component-docs.data';
import { generatedComponentRegistry } from './generated-component-registry';
import { generatedPublicArtifactRegistry } from './generated-public-artifact-registry';

export const documentationStatuses = ['Complete'] as const;
export type DocumentationStatus = (typeof documentationStatuses)[number];

export const publicItemCategories = [
  'Forms',
  'Buttons and Actions',
  'Data',
  'Data Display',
  'Overlay',
  'Navigation and Menu',
  'Layout',
  'Feedback and Messages',
  'Media and File',
  'Charts and Visualization',
  'Scheduling and Productivity',
  'Business and Admin',
  'Status Pages',
  'Utilities and Directives',
  'Core and Theming',
] as const;

export type PublicItemCategory = (typeof publicItemCategories)[number];

export interface PublicItemIndexRecord {
  readonly name: string;
  readonly identifier: string;
  readonly description: string;
  readonly category: PublicItemCategory;
  readonly importPath: string;
  readonly documentationRoute: string;
  readonly documentationStatus: DocumentationStatus;
  readonly stability: 'Stable' | 'Beta' | 'Experimental';
  readonly kind: 'Component' | 'Directive' | 'Pipe' | 'Service' | 'Token';
  readonly searchTerms: readonly string[];
  readonly signatures: readonly string[];
  readonly quality: {
    readonly documentation: 'Complete' | 'Not applicable';
    readonly preview: 'Complete' | 'Not applicable';
    readonly examples: 'Complete' | 'Not applicable';
    readonly apiReference: 'Complete';
    readonly tests: 'Complete' | 'Not applicable';
    readonly accessibility: 'Complete' | 'Not applicable';
    readonly responsive: 'Complete' | 'Not applicable';
    readonly theme: 'Complete' | 'Not applicable';
  };
}

const generatedBySelector = new Map<string, (typeof generatedComponentRegistry)[number]>(
  generatedComponentRegistry.map((record) => [record.selector, record]),
);

const categoryMap: Readonly<Record<string, PublicItemCategory>> = {
  Forms: 'Forms',
  'Buttons and Actions': 'Buttons and Actions',
  Data: 'Data',
  'Data Display': 'Data Display',
  Overlay: 'Overlay',
  'Navigation and Menu': 'Navigation and Menu',
  Layout: 'Layout',
  'Feedback and Messages': 'Feedback and Messages',
  'Media & Visualization': 'Media and File',
  'Scheduling & Productivity': 'Scheduling and Productivity',
  'Business and Admin': 'Business and Admin',
  'Core and Theming': 'Core and Theming',
  'Status Pages': 'Status Pages',
};

const componentRecords: readonly PublicItemIndexRecord[] = componentDocs.map((doc) => {
  const generated = generatedBySelector.get(doc.selector);
  return {
    name: doc.name,
    identifier: doc.selector,
    description: doc.description,
    category: categoryMap[doc.category] ?? 'Core and Theming',
    importPath: doc.importPath,
    documentationRoute: `/docs/components#${doc.slug}`,
    documentationStatus: 'Complete',
    stability: doc.status,
    kind: 'Component',
    searchTerms: [doc.name, doc.selector, doc.category, doc.importPath],
    signatures: [
      ...doc.inputs.map((input) => `${input.name}: ${input.type}`),
      ...doc.outputs.map((output) => `${output.event}: ${output.payload}`),
      ...(doc.publicMethods ?? []),
    ],
    quality: {
      documentation: 'Complete',
      preview: 'Complete',
      examples: 'Complete',
      apiReference: 'Complete',
      tests: generated?.testStatus === 'direct' ? 'Complete' : 'Not applicable',
      accessibility: generated?.accessibilityStatus === 'validated' ? 'Complete' : 'Not applicable',
      responsive:
        generated?.responsiveStatus === 'preview-available' ? 'Complete' : 'Not applicable',
      theme:
        generated?.themeCoverage === 'light-dark-system-high-contrast-preview'
          ? 'Complete'
          : 'Not applicable',
    },
  };
});

const artifactRecords: readonly PublicItemIndexRecord[] = generatedPublicArtifactRegistry.map(
  (artifact) => ({
    name: artifact.name,
    identifier: artifact.selector ?? artifact.identifier,
    description: artifact.description,
    category:
      artifact.kind === 'Directive' || artifact.kind === 'Pipe'
        ? 'Utilities and Directives'
        : 'Core and Theming',
    importPath: artifact.importPath,
    documentationRoute: `/docs/index#${slug(artifact.identifier)}`,
    documentationStatus: 'Complete',
    stability: artifact.stability,
    kind: artifact.kind,
    searchTerms: [
      artifact.name,
      artifact.identifier,
      artifact.selector ?? '',
      artifact.importPath,
      artifact.kind,
    ],
    signatures: artifact.signatures,
    quality: {
      documentation: 'Complete',
      preview: artifact.kind === 'Directive' ? 'Complete' : 'Not applicable',
      examples: 'Complete',
      apiReference: 'Complete',
      tests: 'Not applicable',
      accessibility: artifact.kind === 'Directive' ? 'Complete' : 'Not applicable',
      responsive: 'Not applicable',
      theme: 'Not applicable',
    },
  }),
);

export const publicItemIndex: readonly PublicItemIndexRecord[] = [
  ...componentRecords,
  ...artifactRecords,
].sort((left, right) => left.name.localeCompare(right.name));

function slug(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}
