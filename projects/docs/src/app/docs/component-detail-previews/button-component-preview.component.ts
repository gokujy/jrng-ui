import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-button-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS],
  template: `
    @let example = previewExample();
    @switch (doc().slug) {
      @case ('button') {
        @if (example.key === 'basic') {
          <app-button-basic-demo />
        } @else if (example.key === 'group') {
          <div class="j-preview-row">
            <j-button label="Save" /><j-button label="Preview" variant="outlined" /><j-button
              label="Cancel"
              variant="soft"
            />
          </div>
        } @else if (example.key === 'toolbar') {
          <j-toolbar
            ><j-button label="New" icon="plus" /><j-button
              label="Export"
              variant="outlined" /><j-button
              icon="settings"
              actionDisplay="icon"
              ariaLabel="Toolbar settings"
              variant="soft"
          /></j-toolbar>
        } @else if (example.key === 'form') {
          <form class="j-preview-row">
            <j-button label="Submit" type="submit" /><j-button
              label="Reset"
              type="reset"
              variant="soft"
            />
          </form>
        } @else if (example.key === 'severity') {
          <div class="j-preview-row">
            <j-button label="Primary" /><j-button label="Success" severity="success" /><j-button
              label="Info"
              severity="info"
            /><j-button label="Warning" severity="warning" /><j-button
              label="Danger"
              severity="danger"
            /><j-button label="Neutral" severity="neutral" /><j-button
              label="Contrast"
              severity="contrast"
            />
          </div>
        } @else if (example.key === 'template') {
          <j-button><strong>Approve</strong><span jButtonSuffix>⌘ Enter</span></j-button>
        } @else if (example.key === 'progress') {
          <j-button label="Uploading" [progress]="64" progressState="running" progressLabel />
        } @else if (example.key === 'progress-states') {
          <div class="j-preview-row">
            <j-button label="Uploaded" [progress]="100" progressState="success" />
            <j-button label="Upload failed" [progress]="72" progressState="error" />
            <j-button label="Cancelled" [progress]="38" progressState="cancelled" />
          </div>
        } @else {
          <j-button
            [label]="buttonExampleLabel(example.key)"
            [variant]="buttonExampleVariant(example.key)"
            [severity]="example.key === 'destructive' ? 'danger' : 'primary'"
            [shape]="example.key === 'pill' ? 'pill' : 'rounded'"
            [icon]="buttonExampleIcon(example.key)"
            [iconPosition]="example.key === 'icon-after' ? 'right' : 'left'"
            [actionDisplay]="example.key === 'icon-only' ? 'icon' : 'icon-label'"
            [ariaLabel]="example.key === 'icon-only' ? 'Open settings' : ''"
            [loading]="example.key === 'loading'"
            [disabled]="example.key === 'disabled'"
            [width]="example.key === 'full-width' ? 'full' : 'auto'"
            [badge]="example.key === 'badge' ? 4 : null"
            badgeAriaLabel="4 unread notifications"
          />
        }
      }
      @case ('icon-button') {
        <j-button
          icon="settings"
          ariaLabel="Settings"
          actionDisplay="icon"
          [variant]="buttonVariants[example.index]"
        />
      }
      @case ('copy-button') {
        @if (example.key === 'labels') {
          <j-copy-button
            text="https://jrng.dev/components"
            label="Copy link"
            copiedLabel="Link copied"
            ariaLabel="Copy component link"
          />
        } @else if (example.key === 'icon') {
          <j-copy-button
            text="npm install jrng-ui"
            icon="copy"
            iconOnly
            ariaLabel="Copy install command"
          />
        } @else if (example.key === 'code') {
          <div class="j-copy-code">
            <code>npm install jrng-ui</code>
            <j-copy-button
              text="npm install jrng-ui"
              icon="copy"
              iconOnly
              ariaLabel="Copy install command"
            />
          </div>
        } @else if (example.key === 'disabled') {
          <j-copy-button text="Unavailable token" disabled />
        } @else {
          <j-copy-button text="CUS-2048" label="Copy customer ID" />
        }
      }
      @case ('split-button') {
        <j-split-button
          label="Save customer"
          icon="save"
          [model]="splitButtonItems"
          groupAriaLabel="Customer save actions"
          (primaryAction)="previewStatus = 'Customer saved'"
          (menuAction)="previewStatus = $event.item.label + ' selected'"
        >
          <ng-template jSplitButtonItem let-item>
            <span>{{ item.label }}</span>
          </ng-template>
        </j-split-button>
        <p role="status">{{ previewStatus }}</p>
      }
      @case ('speed-dial') {
        <div
          class="j-speed-dial-preview"
          [class.j-speed-dial-preview--linear]="example.key === 'linear'"
        >
          <j-speed-dial
            [actions]="customerQuickActions"
            [type]="example.key === 'circle' ? 'circle' : 'linear'"
            [radius]="example.key === 'circle' ? 58 : 48"
            [mask]="example.key === 'fixed'"
            [showLabels]="example.key === 'linear'"
          >
            @if (example.key === 'custom-trigger') {
              <ng-template jSpeedDialTrigger let-dial>
                <j-button label="Customer actions" (onClick)="dial.toggle()" />
              </ng-template>
            }
          </j-speed-dial>
        </div>
      }
      @case ('speech-to-text-button') {
        <div class="j-preview-row j-speech-to-text-preview">
          <j-input
            jSpeechToText
            #speech="jSpeechToText"
            label="Customer note"
            placeholder="Select dictate, then speak"
          />
          <j-speech-to-text-button [target]="speech" showLabel />
        </div>
      }
    }
  `,
  styles: [
    `
      .j-speed-dial-preview {
        display: grid;
        inline-size: 100%;
        min-block-size: 12rem;
        overflow: hidden;
        place-items: center;
      }

      .j-speed-dial-preview--linear {
        align-items: end;
        min-block-size: 14rem;
        padding-block-end: var(--j-spacing-4);
      }

      .j-speech-to-text-preview {
        align-items: flex-end;
        flex-wrap: nowrap;
        gap: var(--j-spacing-2);
        inline-size: min(100%, 32rem);
      }

      .j-speech-to-text-preview j-input {
        flex: 1 1 auto;
        min-inline-size: 0;
      }

      @media (max-width: 32rem) {
        .j-speech-to-text-preview {
          align-items: stretch;
          flex-direction: column;
        }
      }
    `,
  ],
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponentPreviewComponent extends ComponentDetailViewBase {
  readonly previewExample = input.required<DetailFeatureExample>();
  previewStatus = 'Choose a save action';
}
