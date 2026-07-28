import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlockComponent } from './code-block.component';
import { JIconComponent } from 'jrng-ui/icon';
import { JTourGuideComponent } from 'jrng-ui/tour';
import { JCopyButtonComponent } from 'jrng-ui/copy-button';
import { JSkeletonComponent } from 'jrng-ui/skeleton';
import { ComponentDetailViewBase } from './component-detail-view-base';
import { ComponentPreviewComponent } from './component-detail-previews/component-preview.component';
import { JBreadcrumbComponent } from 'jrng-ui/breadcrumb';

@Component({
  selector: 'app-component-detail-view',
  imports: [
    CodeBlockComponent,
    JIconComponent,
    JTourGuideComponent,
    JCopyButtonComponent,
    JSkeletonComponent,
    ComponentPreviewComponent,
    JBreadcrumbComponent,
  ],
  template: `
    <div class="j-doc-detail-layout">
      <article class="j-doc-detail" [class.j-doc-detail--api]="detailViewTab() === 'api'">
        <nav class="j-component-view-tabs" aria-label="Component documentation view">
          <button
            type="button"
            [class.is-active]="detailViewTab() === 'features'"
            [attr.aria-pressed]="detailViewTab() === 'features'"
            (click)="detailViewTab.set('features')"
          >
            Features
          </button>
          <button
            type="button"
            [class.is-active]="detailViewTab() === 'api'"
            [attr.aria-pressed]="detailViewTab() === 'api'"
            (click)="detailViewTab.set('api')"
          >
            API
          </button>
        </nav>

        @if (detailViewTab() === 'features') {
          <j-breadcrumb
            [home]="{ label: 'Documentation', routerLink: '/docs' }"
            [model]="detailBreadcrumbItems()"
          />
          <header class="j-doc-detail__header">
            <div>
              <h1 tabindex="-1" data-component-heading>{{ doc().name }}</h1>
              <p class="j-doc-lead">{{ doc().description }}</p>
            </div>
          </header>

          <section class="j-doc-opening-section" id="component-overview">
            <h3>Overview</h3>
            <p>{{ doc().description }}</p>
          </section>

          <section class="j-doc-opening-section" id="component-import">
            <h3>Import</h3>
            <app-code-block label="Import" language="ts" [code]="doc().code.importCode" />
          </section>

          @for (example of featureExamples(); track example.key) {
            <section
              class="j-preview-code-tabs j-feature-example"
              [attr.id]="'component-preview-' + example.key"
              [attr.aria-label]="example.name + ' preview and code'"
            >
              <div class="j-doc-opening-section">
                <h3>{{ example.name }}</h3>
                <p>{{ example.details }}</p>
              </div>
              <div class="j-preview-card" [attr.id]="'component-live-preview-' + example.key">
                @if (example.responsivePreview) {
                  <div class="j-preview-viewport-toolbar" aria-label="Preview viewport">
                    @for (viewport of previewWidths; track viewport.label) {
                      <button
                        type="button"
                        [attr.aria-pressed]="previewWidth() === viewport.width"
                        (click)="previewWidth.set(viewport.width)"
                      >
                        {{ viewport.label }}
                      </button>
                    }
                  </div>
                }
                <div
                  class="j-preview-surface"
                  [style.max-width.px]="example.responsivePreview ? previewWidth() : null"
                  [class.j-preview-surface--overlay]="overlayPreviewSlugs.has(doc().slug)"
                  [class.j-preview-surface--status]="statusPreviewSlugs.has(doc().slug)"
                  [class.j-preview-surface--disabled]="example.key === 'disabled'"
                  [attr.inert]="example.key === 'disabled' ? '' : null"
                  [attr.aria-disabled]="example.key === 'disabled' ? 'true' : null"
                >
                  @defer {
                    <app-component-preview [doc]="doc()" [previewExample]="example" />
                  } @placeholder {
                    <div class="j-preview-stack" aria-label="Loading component preview">
                      <j-skeleton variant="text" width="12rem" />
                      <j-skeleton variant="card" />
                    </div>
                  }
                </div>
              </div>
              <div class="j-full-code" id="j-component-example-code">
                <div class="j-code-header">
                  <div class="j-code-tabs" role="tablist" aria-label="Example source files">
                    @for (tab of codeTabsFor(example); track tab.value) {
                      <button
                        type="button"
                        role="tab"
                        [attr.aria-label]="tab.label"
                        [attr.title]="tab.label"
                        [attr.aria-selected]="featureCodeTab(example) === tab.value"
                        [class.is-active]="featureCodeTab(example) === tab.value"
                        (click)="setFeatureCodeTab(example, tab.value)"
                      >
                        @if (tab.icon) {
                          <j-icon [name]="tab.icon" aria-hidden="true" />
                        } @else {
                          {{ tab.label }}
                        }
                      </button>
                    }
                  </div>
                  <div class="j-example-toolbar" aria-label="Example code actions">
                    <j-copy-button
                      [text]="activeFeatureCode(example)"
                      label="Copy"
                      copiedLabel="Copied"
                      ariaLabel="Copy active example code"
                      icon="copy"
                      iconOnly
                    />
                  </div>
                </div>
                <app-code-block
                  [label]="activeCodeLabel(featureCodeTab(example))"
                  [language]="featureCodeTab(example) === 'html' ? 'html' : 'ts'"
                  [code]="activeFeatureCode(example)"
                />
              </div>
            </section>
          }
        } @else {
          <section class="j-doc-opening-section" id="component-api-overview">
            <h2>{{ doc().name }} API</h2>
            <p>Public inputs, outputs, styling hooks, accessibility, and integration contracts.</p>
          </section>

          <section class="j-doc-grid-sections" id="component-variants">
            <div class="j-doc-section-block">
              <h3>Variants</h3>
              @if (doc().variants.length) {
                <ul>
                  @for (item of doc().variants; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              } @else {
                <div class="j-doc-empty-detail">
                  <j-icon name="info" />
                  <p>{{ doc().name }} does not provide separate visual variants.</p>
                </div>
              }
            </div>
            <div class="j-doc-section-block">
              <h3>Sizes</h3>
              @if (doc().sizes.length) {
                <ul>
                  @for (item of doc().sizes; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              } @else {
                <div class="j-doc-empty-detail">
                  <j-icon name="info" />
                  <p>{{ doc().name }} uses its natural or container-defined size.</p>
                </div>
              }
            </div>
            <div class="j-doc-section-block">
              <h3>States</h3>
              @if (doc().states.length) {
                <ul>
                  @for (item of doc().states; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              } @else {
                <div class="j-doc-empty-detail">
                  <j-icon name="info" />
                  <p>No additional component-specific states are documented.</p>
                </div>
              }
            </div>
          </section>

          @if (priorityGuidance(); as guide) {
            <section class="j-doc-section-block">
              <h3>Advanced example</h3>
              <app-code-block
                label="Advanced usage"
                language="html"
                [code]="guide.advancedExample"
              />
            </section>

            <section class="j-doc-grid-sections j-priority-doc-grid" id="component-advanced-api">
              <div class="j-doc-section-block" id="component-methods">
                <h3>Public methods</h3>
                @if (guide.publicMethods.length) {
                  <ul>
                    @for (item of guide.publicMethods; track item) {
                      <li>
                        <code>{{ item }}</code>
                      </li>
                    }
                  </ul>
                } @else {
                  <div class="j-doc-empty-detail">
                    <j-icon name="info" />
                    <p>
                      {{ doc().name }} has no imperative public methods; prefer inputs and outputs.
                    </p>
                  </div>
                }
              </div>
              <div class="j-doc-section-block" id="component-templates">
                <h3>Templates and slots</h3>
                <ul>
                  @for (item of guide.templates; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
              <div class="j-doc-section-block">
                <h3>Reactive Forms</h3>
                <p>{{ guide.reactiveForms }}</p>
              </div>
              <div class="j-doc-section-block">
                <h3>Validation states</h3>
                <ul>
                  @for (item of guide.validationStates; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
              <div class="j-doc-section-block">
                <h3>Loading and disabled states</h3>
                <ul>
                  @for (item of guide.loadingDisabledStates; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
              <div class="j-doc-section-block">
                <h3>Keyboard behaviour</h3>
                <ul>
                  @for (item of guide.keyboardBehaviour; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
              <div class="j-doc-section-block">
                <h3>Responsive behaviour</h3>
                <p>{{ guide.responsiveBehaviour }}</p>
              </div>
              <div class="j-doc-section-block">
                <h3>Dark-mode preview</h3>
                <div class="j-dark-mode-preview j-dark">
                  <span><j-icon [name]="doc().icon" /></span>
                  <div>
                    <strong>{{ doc().name }}</strong>
                    <p>{{ guide.darkMode }}</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="j-doc-grid-sections">
              <div class="j-doc-section-block">
                <h3>Composed example</h3>
                <p>{{ guide.composedExample }}</p>
              </div>
              <div class="j-doc-section-block">
                <h3>Troubleshooting</h3>
                <ul>
                  @for (item of guide.troubleshooting; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
            </section>
          }

          @if (!priorityGuidance()) {
            <section class="j-doc-grid-sections" id="component-advanced-api">
              <div class="j-doc-section-block" id="component-methods">
                <h3>Public methods</h3>
                @if (doc().publicMethods?.length) {
                  <ul>
                    @for (item of doc().publicMethods ?? []; track item) {
                      <li>
                        <code>{{ item }}</code>
                      </li>
                    }
                  </ul>
                } @else {
                  <p>No imperative method is required; prefer inputs and outputs.</p>
                }
              </div>
              <div class="j-doc-section-block" id="component-templates">
                <h3>Templates and content projection</h3>
                <ul>
                  @for (item of doc().templates ?? []; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
            </section>
          }

          <section class="j-doc-grid-sections" id="component-behaviour-guidance">
            <div class="j-doc-section-block">
              <h3>Keyboard support</h3>
              <ul>
                @for (item of doc().keyboard ?? []; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
            <div class="j-doc-section-block">
              <h3>Responsive behaviour</h3>
              <ul>
                @for (item of doc().responsive ?? []; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
            <div class="j-doc-section-block">
              <h3>Edge cases and limitations</h3>
              <ul>
                @for (item of doc().limitations ?? []; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
            <div class="j-doc-section-block">
              <h3>Related components</h3>
              <ul>
                @for (item of doc().relatedComponents ?? []; track item) {
                  <li>{{ item }}</li>
                } @empty {
                  <li>See components in the same documentation category.</li>
                }
              </ul>
            </div>
            <div class="j-doc-section-block">
              <h3>Testing notes</h3>
              <ul>
                @for (item of doc().testingNotes ?? []; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          </section>

          <section class="j-doc-section-block" id="component-api">
            <h3>Props / Inputs</h3>
            @if (doc().inputs.length) {
              <div class="j-table-wrap">
                <table class="j-api-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of doc().inputs; track row.name) {
                      <tr>
                        <td>
                          <code>{{ row.name }}</code>
                        </td>
                        <td>{{ row.type }}</td>
                        <td>
                          <code>{{ row.defaultValue }}</code>
                        </td>
                        <td>{{ row.description }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="j-doc-empty-detail">
                <j-icon name="info" />
                <p>
                  {{ doc().name }} does not expose additional component-specific inputs. Use its
                  documented selector and projected content.
                </p>
              </div>
            }
          </section>

          <section class="j-doc-section-block" id="component-events">
            <h3>Events / Outputs</h3>
            @if (doc().outputs.length) {
              <div class="j-table-wrap">
                <table class="j-api-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Payload</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of doc().outputs; track row.event) {
                      <tr>
                        <td>
                          <code>{{ row.event }}</code>
                        </td>
                        <td>{{ row.payload }}</td>
                        <td>{{ row.description }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="j-doc-empty-detail">
                <j-icon name="info" />
                <p>{{ doc().name }} does not emit component-specific events.</p>
              </div>
            }
          </section>

          <section class="j-doc-section-block" id="component-css-variables">
            <h3>CSS variables</h3>
            @if ((doc().cssVariables?.length ?? 0) > 0) {
              <div class="j-table-wrap">
                <table class="j-api-table">
                  <thead>
                    <tr>
                      <th>Variable</th>
                      <th>Default / fallback</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of doc().cssVariables ?? []; track row.variable) {
                      <tr>
                        <td>
                          <code>{{ row.variable }}</code>
                        </td>
                        <td>
                          <code>{{ row.fallback }}</code>
                        </td>
                        <td>{{ row.description }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="j-doc-empty-detail">
                <j-icon name="palette" />
                <p>
                  {{ doc().name }} has no component-specific CSS variables. It inherits the shared
                  JRNG UI semantic theme tokens.
                </p>
              </div>
            }
          </section>

          <section class="j-doc-grid-sections j-api-support-grid">
            <div class="j-doc-section-block" id="component-accessibility">
              <h3>Accessibility</h3>
              @if (doc().accessibility.length) {
                <ul>
                  @for (item of doc().accessibility; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              } @else {
                <div class="j-doc-empty-detail">
                  <j-icon name="accessibility" />
                  <p>No additional accessibility requirements beyond the documented usage.</p>
                </div>
              }
            </div>
            <div class="j-doc-section-block" id="component-best-practices">
              <h3>Best Practices</h3>
              @if (doc().bestPractices.length) {
                <ul>
                  @for (item of doc().bestPractices; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              } @else {
                <div class="j-doc-empty-detail">
                  <j-icon name="lightbulb" />
                  <p>No additional component-specific best practices are required.</p>
                </div>
              }
            </div>
          </section>

          @if (doc().commonMistakes?.length) {
            <section class="j-doc-section-block">
              <h3>Common mistakes</h3>
              <ul>
                @for (item of doc().commonMistakes; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </section>
          }

          <section class="j-doc-grid-sections">
            <div class="j-doc-section-block" id="component-faq">
              <h3>FAQ</h3>
              <p>
                Use the runnable examples above as the supported integration baseline. APIs not
                listed in this page's examples are not part of the documented component contract.
              </p>
            </div>
            <div class="j-doc-section-block" id="component-changelog">
              <h3>Changelog</h3>
              <p>
                Review the package changelog before upgrading for component-specific additions,
                fixes, and migrations.
              </p>
            </div>
          </section>
        }
      </article>
      <aside class="j-component-contents" aria-label="On this page">
        @for (item of contentsItems(); track item.id) {
          <button
            type="button"
            [class.is-active]="activeContentsId() === item.id"
            [class.is-nested]="item.level === 1"
            [attr.aria-current]="activeContentsId() === item.id ? 'location' : null"
            (click)="scrollToContents(item.id)"
          >
            {{ item.label }}
          </button>
        }
      </aside>
    </div>
    <j-tour-guide />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentDetailViewComponent extends ComponentDetailViewBase {}
