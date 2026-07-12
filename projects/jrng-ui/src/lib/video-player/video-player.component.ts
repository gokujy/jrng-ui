import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  output,
  viewChild,
  ElementRef,
  computed,
  inject,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'j-video-player',
  imports: [],
  template: `
    <figure
      class="j-video-player"
      [class]="styleClass()"
      data-jc-name="video-player"
      data-jc-section="root"
    >
      @if (embedUrl(); as url) {
        <iframe
          class="j-video-player__media j-video-player__embed"
          [src]="url"
          [title]="ariaLabel()"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      } @else {
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
      }
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
        aspect-ratio: 16 / 9;
        background: black;
        display: block;
        width: 100%;
      }

      .j-video-player__embed {
        border: 0;
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
  private readonly sanitizer = inject(DomSanitizer);
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
  readonly embedUrl = computed(() => {
    const id = this.youtubeId(this.src());
    return id
      ? this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
        )
      : null;
  });

  play(): void {
    void this.video()?.nativeElement.play();
  }

  pause(): void {
    this.video()?.nativeElement.pause();
  }

  private youtubeId(url: string): string {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
    );
    return match?.[1] ?? '';
  }
}
