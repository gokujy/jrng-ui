import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
  TemplateRef,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { JButtonComponent } from 'jrng-ui/button';
import { jCreateId, JLiveAnnouncerService } from 'jrng-ui/core';
import {
  JQueryCondition,
  JQueryConditionValue,
  JQueryField,
  JQueryFieldType,
  JQueryGroup,
  JQueryNode,
  JQueryNormalisationResult,
  JQueryOperator,
  JQueryPrimitive,
  JQueryValidationIssue,
  J_QUERY_OPERATORS,
  jAppendQueryNode,
  jCreateQueryCondition,
  jCreateQueryGroup,
  jDefaultQueryValue,
  jDuplicateQueryNode,
  jNormaliseQueryExpression,
  jRemoveQueryNode,
  jUpdateQueryNode,
  jValidateQueryExpression,
} from './query-builder.model';

export interface JQueryFieldTemplateContext {
  readonly $implicit: JQueryField | undefined;
  readonly field: JQueryField | undefined;
  readonly condition: JQueryCondition;
}

export interface JQueryValueTemplateContext {
  readonly $implicit: JQueryCondition;
  readonly condition: JQueryCondition;
  readonly field: JQueryField | undefined;
  readonly operator: JQueryOperator | undefined;
  readonly update: (value: JQueryConditionValue) => void;
}

export interface JQueryGroupTemplateContext {
  readonly $implicit: JQueryGroup;
  readonly group: JQueryGroup;
  readonly depth: number;
}

export interface JQueryEmptyTemplateContext {
  readonly $implicit: JQueryGroup;
  readonly group: JQueryGroup;
}

interface JQueryRow {
  readonly node: JQueryNode;
  readonly parentId: string | null;
  readonly depth: number;
}

@Component({
  selector: 'j-query-builder',
  imports: [JButtonComponent, NgTemplateOutlet],
  template: `
    <section
      class="j-query-builder"
      [class.j-query-builder--disabled]="isDisabled()"
      [class.j-query-builder--readonly]="readonly()"
      [class.j-query-builder--invalid]="issues().length > 0"
      [class]="styleClass()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-describedby]="issues().length ? errorId : null"
      [attr.aria-disabled]="isDisabled()"
      [attr.aria-readonly]="readonly()"
      [attr.dir]="dir()"
      data-jc-name="query-builder"
      data-jc-section="root"
    >
      <header class="j-query-builder__header">
        <div>
          <strong>{{ label() }}</strong>
          @if (description()) {
            <p>{{ description() }}</p>
          }
        </div>
        @if (!readonly()) {
          <div class="j-query-builder__actions">
            <j-button
              label="Add condition"
              variant="outlined"
              [disabled]="isDisabled()"
              (onClick)="addCondition(model().id)"
            />
            <j-button
              label="Add group"
              variant="outlined"
              [disabled]="isDisabled()"
              (onClick)="addGroup(model().id)"
            />
          </div>
        }
      </header>

      <div class="j-query-builder__tree">
        @for (row of rows(); track row.node.id) {
          @if (row.node.kind === 'group') {
            <section
              class="j-query-builder__group"
              [class.j-query-builder__group--root]="row.parentId === null"
              [style.--j-query-depth]="row.depth"
              [attr.aria-label]="groupLabel(row.node, row.depth)"
              [attr.data-node-id]="row.node.id"
            >
              <header class="j-query-builder__group-header">
                @if (groupHeaderTemplate(); as template) {
                  <ng-container
                    [ngTemplateOutlet]="template"
                    [ngTemplateOutletContext]="groupContext(row.node, row.depth)"
                  />
                } @else {
                  <span>{{ row.parentId === null ? 'Match' : 'Nested group' }}</span>
                  <select
                    [attr.aria-label]="'Condition logic for ' + groupLabel(row.node, row.depth)"
                    [value]="row.node.join"
                    [disabled]="!canMutate()"
                    (change)="changeJoin(row.node.id, $event)"
                    (blur)="markTouched()"
                  >
                    <option value="and">All conditions (AND)</option>
                    <option value="or">Any condition (OR)</option>
                  </select>
                }
                @if (!readonly()) {
                  <div class="j-query-builder__row-actions">
                    <j-button
                      label="Add condition"
                      variant="text"
                      [disabled]="isDisabled()"
                      (onClick)="addCondition(row.node.id)"
                    />
                    <j-button
                      label="Add group"
                      variant="text"
                      [disabled]="isDisabled()"
                      (onClick)="addGroup(row.node.id)"
                    />
                    @if (row.parentId !== null) {
                      <j-button
                        [label]="'Duplicate ' + groupLabel(row.node, row.depth)"
                        variant="text"
                        [disabled]="isDisabled()"
                        (onClick)="duplicateNode(row.node.id)"
                      />
                      <j-button
                        [label]="'Remove ' + groupLabel(row.node, row.depth)"
                        variant="text"
                        [disabled]="isDisabled()"
                        (onClick)="removeNode(row.node.id, row.parentId)"
                      />
                    }
                  </div>
                }
              </header>
            </section>
          } @else {
            <div
              class="j-query-builder__condition"
              [class.j-query-builder__condition--invalid]="nodeIssues(row.node.id).length"
              [style.--j-query-depth]="row.depth"
              [attr.data-node-id]="row.node.id"
              role="group"
              [attr.aria-label]="'Condition ' + conditionNumber(row.node.id)"
              [attr.aria-describedby]="
                nodeIssues(row.node.id).length ? errorId + '-' + row.node.id : null
              "
            >
              <div class="j-query-builder__control">
                <span>Field</span>
                @if (fieldTemplate(); as template) {
                  <ng-container
                    [ngTemplateOutlet]="template"
                    [ngTemplateOutletContext]="fieldContext(row.node)"
                  />
                } @else {
                  <select
                    aria-label="Field"
                    [value]="row.node.field"
                    [disabled]="!canMutate()"
                    (change)="changeField(row.node.id, $event)"
                    (blur)="markTouched()"
                  >
                    @if (!field(row.node.field)) {
                      <option [value]="row.node.field">
                        {{ row.node.field ? 'Unknown field: ' + row.node.field : 'Choose field' }}
                      </option>
                    }
                    @for (item of fields(); track item.key) {
                      <option [value]="item.key" [disabled]="item.disabled">
                        {{ item.label }}
                      </option>
                    }
                  </select>
                }
              </div>

              <label class="j-query-builder__control">
                <span>Operator</span>
                <select
                  aria-label="Operator"
                  [value]="row.node.operator"
                  [disabled]="!canMutate()"
                  (change)="changeOperator(row.node.id, $event)"
                  (blur)="markTouched()"
                >
                  @if (!operator(row.node.operator)) {
                    <option [value]="row.node.operator">
                      {{
                        row.node.operator
                          ? 'Unknown operator: ' + row.node.operator
                          : 'Choose operator'
                      }}
                    </option>
                  }
                  @for (item of operatorsFor(row.node); track item.key) {
                    <option [value]="item.key">{{ item.label }}</option>
                  }
                </select>
              </label>

              <div class="j-query-builder__value">
                <span>Value</span>
                @if (valueEditorTemplate(); as template) {
                  <ng-container
                    [ngTemplateOutlet]="template"
                    [ngTemplateOutletContext]="valueContext(row.node)"
                  />
                } @else {
                  @switch (operator(row.node.operator)?.arity) {
                    @case ('none') {
                      <span class="j-query-builder__no-value">No value required</span>
                    }
                    @case ('range') {
                      <div class="j-query-builder__range">
                        <input
                          [type]="inputType(row.node)"
                          aria-label="Range start"
                          [value]="rangeValue(row.node.value, 'from')"
                          [disabled]="!canMutate()"
                          (input)="changeRangeValue(row.node.id, 'from', $event)"
                          (blur)="markTouched()"
                        />
                        <span aria-hidden="true">to</span>
                        <input
                          [type]="inputType(row.node)"
                          aria-label="Range end"
                          [value]="rangeValue(row.node.value, 'to')"
                          [disabled]="!canMutate()"
                          (input)="changeRangeValue(row.node.id, 'to', $event)"
                          (blur)="markTouched()"
                        />
                      </div>
                    }
                    @case ('list') {
                      <input
                        type="text"
                        aria-label="Comma-separated values"
                        [value]="listValue(row.node.value)"
                        [disabled]="!canMutate()"
                        (input)="changeListValue(row.node.id, $event)"
                        (blur)="markTouched()"
                      />
                    }
                    @default {
                      @if (field(row.node.field)?.type === 'boolean') {
                        <select
                          aria-label="Boolean value"
                          [value]="stringValue(row.node.value)"
                          [disabled]="!canMutate()"
                          (change)="changeScalarValue(row.node.id, $event)"
                          (blur)="markTouched()"
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      } @else {
                        <input
                          [type]="inputType(row.node)"
                          aria-label="Condition value"
                          [value]="stringValue(row.node.value)"
                          [disabled]="!canMutate()"
                          (input)="changeScalarValue(row.node.id, $event)"
                          (blur)="markTouched()"
                        />
                      }
                    }
                  }
                }
              </div>

              @if (!readonly()) {
                <div class="j-query-builder__row-actions">
                  <j-button
                    [label]="'Duplicate condition ' + conditionNumber(row.node.id)"
                    variant="text"
                    [disabled]="isDisabled()"
                    (onClick)="duplicateNode(row.node.id)"
                  />
                  <j-button
                    [label]="'Remove condition ' + conditionNumber(row.node.id)"
                    variant="text"
                    [disabled]="isDisabled()"
                    (onClick)="removeNode(row.node.id, row.parentId)"
                  />
                </div>
              }

              @if (nodeIssues(row.node.id).length) {
                <ul
                  class="j-query-builder__node-errors"
                  [id]="errorId + '-' + row.node.id"
                  aria-live="polite"
                >
                  @for (issue of nodeIssues(row.node.id); track issue.code + issue.path) {
                    <li>{{ issue.message }}</li>
                  }
                </ul>
              }
            </div>
          }
        }

        @if (model().children.length === 0) {
          <div class="j-query-builder__empty">
            @if (emptyTemplate(); as template) {
              <ng-container
                [ngTemplateOutlet]="template"
                [ngTemplateOutletContext]="emptyContext()"
              />
            } @else {
              <p>{{ emptyMessage() }}</p>
              @if (!readonly()) {
                <j-button
                  label="Add first condition"
                  [disabled]="isDisabled()"
                  (onClick)="addCondition(model().id)"
                />
              }
            }
          </div>
        }
      </div>

      @if (issues().length) {
        <div class="j-query-builder__errors" [id]="errorId" role="status">
          <strong>{{ errorLabel() }}</strong>
          <span>{{ issues().length }} issue{{ issues().length === 1 ? '' : 's' }}</span>
        </div>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-query-builder {
        background: var(--j-query-builder-bg, var(--j-color-card, #fff));
        border: 1px solid var(--j-query-builder-border, var(--j-color-border, #e2e8f0));
        border-radius: var(--j-query-builder-radius, var(--j-radius-lg, 0.75rem));
        color: var(--j-query-builder-color, var(--j-color-card-foreground, #111827));
        display: grid;
        gap: var(--j-spacing-3, 0.75rem);
        padding: var(--j-spacing-4, 1rem);
      }

      .j-query-builder__header,
      .j-query-builder__group-header,
      .j-query-builder__actions,
      .j-query-builder__row-actions,
      .j-query-builder__range {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2, 0.5rem);
      }

      .j-query-builder__header {
        justify-content: space-between;
      }

      .j-query-builder__header p {
        color: var(--j-color-muted-foreground, #64748b);
        margin: var(--j-spacing-1, 0.25rem) 0 0;
      }

      .j-query-builder__tree {
        display: grid;
        gap: var(--j-spacing-2, 0.5rem);
      }

      .j-query-builder__group,
      .j-query-builder__condition {
        margin-inline-start: calc(var(--j-query-depth) * var(--j-query-builder-indent, 1.25rem));
      }

      .j-query-builder__group {
        border-inline-start: 3px solid
          var(--j-query-builder-group-accent, var(--j-color-primary, #2563eb));
        padding-inline-start: var(--j-spacing-3, 0.75rem);
      }

      .j-query-builder__group--root {
        margin-inline-start: 0;
      }

      .j-query-builder__group-header {
        background: var(--j-query-builder-group-bg, var(--j-color-muted, #f1f5f9));
        border-radius: var(--j-radius-md, 0.5rem);
        justify-content: space-between;
        padding: var(--j-spacing-2, 0.5rem);
      }

      .j-query-builder__condition {
        align-items: end;
        border: 1px solid var(--j-color-border, #e2e8f0);
        border-radius: var(--j-radius-md, 0.5rem);
        display: grid;
        gap: var(--j-spacing-2, 0.5rem);
        grid-template-columns: minmax(10rem, 1fr) minmax(10rem, 1fr) minmax(12rem, 1.5fr) auto;
        padding: var(--j-spacing-3, 0.75rem);
      }

      .j-query-builder__condition--invalid {
        border-color: var(--j-query-builder-error, var(--j-color-danger, #dc2626));
      }

      .j-query-builder__control,
      .j-query-builder__value {
        display: grid;
        gap: var(--j-spacing-1, 0.25rem);
        min-width: 0;
      }

      .j-query-builder__control > span,
      .j-query-builder__value > span:first-child {
        color: var(--j-color-muted-foreground, #64748b);
        font-size: var(--j-font-size-xs, 0.75rem);
        font-weight: var(--j-font-weight-semibold, 600);
      }

      .j-query-builder input,
      .j-query-builder select {
        background: var(--j-query-builder-control-bg, var(--j-color-card, #fff));
        border: 1px solid var(--j-query-builder-control-border, var(--j-color-border, #cbd5e1));
        border-radius: var(--j-radius-md, 0.5rem);
        color: inherit;
        font: inherit;
        min-height: 2.5rem;
        min-width: 0;
        padding-inline: var(--j-spacing-2, 0.5rem);
        width: 100%;
      }

      .j-query-builder input:focus-visible,
      .j-query-builder select:focus-visible {
        box-shadow: var(--j-query-builder-focus, var(--j-focus-ring));
        outline: none;
      }

      .j-query-builder__range {
        flex-wrap: nowrap;
      }

      .j-query-builder__no-value {
        align-items: center;
        color: var(--j-color-muted-foreground, #64748b);
        display: flex;
        min-height: 2.5rem;
      }

      .j-query-builder__node-errors {
        color: var(--j-query-builder-error, var(--j-color-danger, #dc2626));
        font-size: var(--j-font-size-xs, 0.75rem);
        grid-column: 1 / -1;
        margin: 0;
        padding-inline-start: var(--j-spacing-5, 1.25rem);
      }

      .j-query-builder__empty {
        border: 1px dashed var(--j-color-border, #cbd5e1);
        border-radius: var(--j-radius-md, 0.5rem);
        color: var(--j-color-muted-foreground, #64748b);
        display: grid;
        justify-items: center;
        padding: var(--j-spacing-6, 1.5rem);
        text-align: center;
      }

      .j-query-builder__errors {
        align-items: center;
        background: color-mix(
          in srgb,
          var(--j-query-builder-error, var(--j-color-danger, #dc2626)) 10%,
          transparent
        );
        border-radius: var(--j-radius-md, 0.5rem);
        color: var(--j-query-builder-error, var(--j-color-danger, #dc2626));
        display: flex;
        gap: var(--j-spacing-2, 0.5rem);
        justify-content: space-between;
        padding: var(--j-spacing-2, 0.5rem);
      }

      .j-query-builder--disabled {
        opacity: var(--j-disabled-opacity, 0.6);
      }

      .j-query-builder--readonly .j-query-builder__condition {
        background: var(--j-color-muted, #f8fafc);
      }

      @media (max-width: 760px) {
        .j-query-builder__condition {
          grid-template-columns: 1fr;
          margin-inline-start: min(calc(var(--j-query-depth) * var(--j-spacing-2, 0.5rem)), 1.5rem);
        }

        .j-query-builder__row-actions {
          justify-content: flex-start;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .j-query-builder * {
          scroll-behavior: auto !important;
        }
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JQueryBuilderComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => JQueryBuilderComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JQueryBuilderComponent implements ControlValueAccessor, Validator {
  readonly value = input<JQueryGroup | null>(null);
  readonly fields = input<readonly JQueryField[]>([]);
  readonly operators = input<readonly JQueryOperator[]>(J_QUERY_OPERATORS);
  readonly label = input('Query builder');
  readonly description = input('Create conditions that an application can evaluate.');
  readonly ariaLabel = input('Query builder');
  readonly emptyMessage = input('No conditions yet.');
  readonly errorLabel = input('Review query');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly dir = input<'ltr' | 'rtl'>('ltr');
  readonly styleClass = input('');

  readonly valueChange = output<JQueryGroup>();
  readonly validationChange = output<readonly JQueryValidationIssue[]>();

  readonly fieldTemplate = contentChild<unknown, TemplateRef<JQueryFieldTemplateContext>>(
    'jQueryField',
    { read: TemplateRef },
  );
  readonly valueEditorTemplate = contentChild<unknown, TemplateRef<JQueryValueTemplateContext>>(
    'jQueryValueEditor',
    { read: TemplateRef },
  );
  readonly groupHeaderTemplate = contentChild<unknown, TemplateRef<JQueryGroupTemplateContext>>(
    'jQueryGroupHeader',
    { read: TemplateRef },
  );
  readonly emptyTemplate = contentChild<unknown, TemplateRef<JQueryEmptyTemplateContext>>(
    'jQueryEmpty',
    { read: TemplateRef },
  );

  readonly errorId = jCreateId('j-query-errors');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly announcer = inject(JLiveAnnouncerService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly formDisabled = signal(false);
  private readonly internalValue = signal<JQueryGroup>(jCreateQueryGroup('query-root'));
  private readonly recoveryIssues = signal<readonly JQueryValidationIssue[]>([]);
  private lastValidationKey = '';
  private onChange: (value: JQueryGroup) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly model = computed(() => this.internalValue());
  readonly rows = computed(() => flattenQuery(this.model()));
  readonly issues = computed(() => [
    ...this.recoveryIssues(),
    ...jValidateQueryExpression(this.model(), this.fields(), this.operators()),
  ]);

  constructor() {
    effect(() => {
      const external = this.value();
      if (external) this.acceptExternal(external);
    });
    effect(() => {
      const current = this.issues();
      const key = current.map((issue) => `${issue.code}:${issue.nodeId}:${issue.path}`).join('|');
      if (key === this.lastValidationKey) return;
      this.lastValidationKey = key;
      this.validationChange.emit(current);
      this.onValidatorChange();
    });
  }

  canMutate(): boolean {
    return !this.isDisabled() && !this.readonly();
  }

  addCondition(groupId = this.model().id): void {
    if (!this.canMutate()) return;
    const condition = jCreateQueryCondition(
      jCreateId('j-query-condition'),
      this.fields().find((field) => !field.disabled),
      this.operators(),
    );
    this.commit(jAppendQueryNode(this.model(), groupId, condition), 'Condition added.');
    this.focusNode(condition.id);
  }

  addGroup(groupId = this.model().id): void {
    if (!this.canMutate()) return;
    const group = jCreateQueryGroup(jCreateId('j-query-group'));
    this.commit(jAppendQueryNode(this.model(), groupId, group), 'Group added.');
    this.focusNode(group.id);
  }

  removeNode(nodeId: string, parentId: string | null): void {
    if (!this.canMutate() || nodeId === this.model().id) return;
    this.commit(jRemoveQueryNode(this.model(), nodeId), 'Item removed.');
    this.focusNode(parentId ?? this.model().id);
  }

  duplicateNode(nodeId: string): void {
    if (!this.canMutate()) return;
    this.commit(
      jDuplicateQueryNode(this.model(), nodeId, (kind) => jCreateId(`j-query-${kind}`)),
      'Item duplicated.',
    );
  }

  clear(): void {
    if (!this.canMutate()) return;
    this.commit({ ...this.model(), children: [] }, 'All conditions removed.');
  }

  validateExpression(): readonly JQueryValidationIssue[] {
    return this.issues();
  }

  markTouched(): void {
    this.onTouched();
  }

  changeJoin(nodeId: string, event: Event): void {
    const join = (event.target as HTMLSelectElement).value === 'or' ? 'or' : 'and';
    this.updateNode(nodeId, (node) => (node.kind === 'group' ? { ...node, join } : node));
  }

  changeField(nodeId: string, event: Event): void {
    const key = (event.target as HTMLSelectElement).value;
    const field = this.field(key);
    const operator = this.operatorsForField(field)[0];
    this.updateNode(nodeId, (node) =>
      node.kind === 'condition'
        ? {
            ...node,
            field: key,
            operator: operator?.key ?? '',
            value: jDefaultQueryValue(field?.type ?? 'text', operator?.arity ?? 'single'),
          }
        : node,
    );
  }

  changeOperator(nodeId: string, event: Event): void {
    const key = (event.target as HTMLSelectElement).value;
    this.updateNode(nodeId, (node) => {
      if (node.kind !== 'condition') return node;
      const field = this.field(node.field);
      const operator = this.operator(key);
      return {
        ...node,
        operator: key,
        value: jDefaultQueryValue(field?.type ?? 'text', operator?.arity ?? 'single'),
      };
    });
  }

  changeScalarValue(nodeId: string, event: Event): void {
    const condition = this.condition(nodeId);
    const field = condition ? this.field(condition.field) : undefined;
    this.setConditionValue(
      nodeId,
      parseScalar((event.target as HTMLInputElement).value, field?.type),
    );
  }

  changeRangeValue(nodeId: string, part: 'from' | 'to', event: Event): void {
    const condition = this.condition(nodeId);
    const field = condition ? this.field(condition.field) : undefined;
    const current = condition?.value;
    const range = isRangeValue(current)
      ? current
      : { from: null as JQueryPrimitive, to: null as JQueryPrimitive };
    this.setConditionValue(nodeId, {
      ...range,
      [part]: parseScalar((event.target as HTMLInputElement).value, field?.type),
    });
  }

  changeListValue(nodeId: string, event: Event): void {
    const condition = this.condition(nodeId);
    const field = condition ? this.field(condition.field) : undefined;
    const values = (event.target as HTMLInputElement).value
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => parseScalar(value, field?.type));
    this.setConditionValue(nodeId, values);
  }

  field(key: string): JQueryField | undefined {
    return this.fields().find((field) => field.key === key);
  }

  operator(key: string): JQueryOperator | undefined {
    return this.operators().find((operator) => operator.key === key);
  }

  operatorsFor(condition: JQueryCondition): readonly JQueryOperator[] {
    return this.operatorsForField(this.field(condition.field));
  }

  nodeIssues(nodeId: string): readonly JQueryValidationIssue[] {
    return this.issues().filter((issue) => issue.nodeId === nodeId);
  }

  inputType(condition: JQueryCondition): 'text' | 'number' | 'date' {
    const type = this.field(condition.field)?.type;
    return type === 'number' || type === 'date' ? type : 'text';
  }

  stringValue(value: JQueryConditionValue): string {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      ? String(value)
      : '';
  }

  listValue(value: JQueryConditionValue): string {
    return Array.isArray(value) ? value.join(', ') : '';
  }

  rangeValue(value: JQueryConditionValue, part: 'from' | 'to'): string {
    return isRangeValue(value) && value[part] !== null ? String(value[part]) : '';
  }

  conditionNumber(nodeId: string): number {
    return (
      this.rows()
        .filter((row) => row.node.kind === 'condition')
        .findIndex((row) => row.node.id === nodeId) + 1
    );
  }

  groupLabel(group: JQueryGroup, depth: number): string {
    return `${depth === 0 ? 'Root' : 'Nested'} ${group.join.toUpperCase()} condition group`;
  }

  fieldContext(condition: JQueryCondition): JQueryFieldTemplateContext {
    const field = this.field(condition.field);
    return { $implicit: field, field, condition };
  }

  valueContext(condition: JQueryCondition): JQueryValueTemplateContext {
    return {
      $implicit: condition,
      condition,
      field: this.field(condition.field),
      operator: this.operator(condition.operator),
      update: (value) => this.setConditionValue(condition.id, value),
    };
  }

  groupContext(group: JQueryGroup, depth: number): JQueryGroupTemplateContext {
    return { $implicit: group, group, depth };
  }

  emptyContext(): JQueryEmptyTemplateContext {
    return { $implicit: this.model(), group: this.model() };
  }

  writeValue(value: JQueryGroup | null): void {
    this.acceptExternal(value);
  }

  registerOnChange(fn: (value: JQueryGroup) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const issues = jValidateQueryExpression(control.value, this.fields(), this.operators());
    return issues.length ? { queryExpression: issues } : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  private acceptExternal(value: unknown): void {
    const result: JQueryNormalisationResult = jNormaliseQueryExpression(value);
    this.internalValue.set(result.model);
    this.recoveryIssues.set(result.issues);
  }

  private updateNode(nodeId: string, update: (node: JQueryNode) => JQueryNode): void {
    if (!this.canMutate()) return;
    this.commit(jUpdateQueryNode(this.model(), nodeId, update));
  }

  private setConditionValue(nodeId: string, value: JQueryConditionValue): void {
    this.updateNode(nodeId, (node) => (node.kind === 'condition' ? { ...node, value } : node));
  }

  private condition(nodeId: string): JQueryCondition | undefined {
    const row = this.rows().find((candidate) => candidate.node.id === nodeId);
    return row?.node.kind === 'condition' ? row.node : undefined;
  }

  private operatorsForField(field: JQueryField | undefined): readonly JQueryOperator[] {
    if (!field) return this.operators();
    return this.operators().filter(
      (operator) =>
        operator.fieldTypes.includes(field.type) &&
        (!field.operators || field.operators.includes(operator.key)),
    );
  }

  private commit(value: JQueryGroup, announcement?: string): void {
    this.internalValue.set(value);
    this.recoveryIssues.set([]);
    this.valueChange.emit(value);
    this.onChange(value);
    this.onTouched();
    if (announcement) this.announcer.announce(announcement);
  }

  private focusNode(nodeId: string): void {
    if (!this.isBrowser) return;
    queueMicrotask(() => {
      const node = this.host.nativeElement.querySelector<HTMLElement>(
        `[data-node-id="${escapeAttribute(nodeId)}"]`,
      );
      node?.querySelector<HTMLElement>('button, select, input, [tabindex]')?.focus();
    });
  }
}

function flattenQuery(root: JQueryGroup): readonly JQueryRow[] {
  const rows: JQueryRow[] = [];
  const visit = (node: JQueryNode, parentId: string | null, depth: number): void => {
    rows.push({ node, parentId, depth });
    if (node.kind === 'group') {
      node.children.forEach((child) => visit(child, node.id, depth + 1));
    }
  };
  visit(root, null, 0);
  return rows;
}

function parseScalar(value: string, type: JQueryFieldType | undefined): JQueryPrimitive {
  if (type === 'number') {
    const number = Number(value);
    return value.trim() && Number.isFinite(number) ? number : null;
  }
  if (type === 'boolean') return value === 'true';
  return value;
}

function isRangeValue(
  value: JQueryConditionValue | undefined,
): value is { readonly from: JQueryPrimitive; readonly to: JQueryPrimitive } {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'from' in value &&
    'to' in value
  );
}

function escapeAttribute(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}
