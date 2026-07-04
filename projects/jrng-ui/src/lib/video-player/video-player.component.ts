import { ChangeDetectionStrategy, Component, booleanAttribute, input, output, viewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'j-video-player',
  imports: [],
  template: `
    <figure class="j-video-player" [class]="styleClass()" data-jc-name="video-player" data-jc-section="root">
      <video
        #video
        class="j-video-player__media"
        [src]="src()"
        [poster]="poster() || null"
        [controls]="controls()"
        [muted]="muted()"
        [loop]="loop()"
        [autoplay]="autoplay()"
        [attr.aria-label]="ariaLabel()"
        (play)="played.emit()"
        (pause)="paused.emit()"
        (ended)="ended.emit()"
      ></video>
      @if (caption()) {
        <figcaption>{{ caption() }}</figcaption>
      }
    </figure>
  `,
  styles: [
    `
      .j-video-player {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        display: grid;
        gap: var(--j-spacing-2);
        margin: 0;
        overflow: hidden;
      }

      .j-video-player__media {
        background: black;
        display: block;
        width: 100%;
      }

      .j-video-player figcaption {
        color: var(--j-color-muted-foreground);
        padding: 0 var(--j-spacing-3) var(--j-spacing-3);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JVideoPlayerComponent {
  readonly src = input('');
  readonly poster = input('');
  readonly caption = input('');
  readonly ariaLabel = input('Video player');
  readonly controls = input(true, { transform: booleanAttribute });
  readonly muted = input(false, { transform: booleanAttribute });
  readonly loop = input(false, { transform: booleanAttribute });
  readonly autoplay = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');

  readonly played = output<void>();
  readonly paused = output<void>();
  readonly ended = output<void>();

  readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');

  play(): void {
    void this.video()?.nativeElement.play();
  }

  pause(): void {
    this.video()?.nativeElement.pause();
  }
}
