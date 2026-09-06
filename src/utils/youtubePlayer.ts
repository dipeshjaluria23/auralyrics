/**
 * YouTube IFrame API Controller
 * Provides seamless background audio playback and time synchronization
 * for YouTube & YouTube Music tracks.
 */

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
  }
}

export interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  loadVideoById: (options: { videoId: string; startSeconds?: number }) => void;
  cueVideoById: (options: { videoId: string; startSeconds?: number }) => void;
  destroy: () => void;
}

class YouTubeAudioController {
  private player: YTPlayerInstance | null = null;
  private isApiReady = false;
  private pendingVideoId: string | null = null;

  private pendingStartTime = 0;
  private onStateChangeCallback: ((state: number) => void) | null = null;
  private containerElement: HTMLDivElement | null = null;

  public init() {
    if (this.isApiReady) return;

    if (window.YT && window.YT.Player) {
      this.isApiReady = true;
      this.createPlayerElement();
      return;
    }

    // Load YouTube Iframe API Script
    const existingScript = document.getElementById('yt-iframe-api');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        this.isApiReady = true;
        this.createPlayerElement();
      };
    }
  }

  private createPlayerElement() {
    if (this.player) return;

    let el = document.getElementById('youtube-audio-container') as HTMLDivElement;
    if (!el) {
      el = document.createElement('div');
      el.id = 'youtube-audio-container';
      el.style.position = 'fixed';
      el.style.bottom = '-9999px';
      el.style.left = '-9999px';
      el.style.width = '1px';
      el.style.height = '1px';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      document.body.appendChild(el);
    }
    this.containerElement = el;

    const playerDiv = document.createElement('div');
    playerDiv.id = 'yt-player-target';
    el.appendChild(playerDiv);

    try {
      this.player = new window.YT.Player('yt-player-target', {
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            if (this.pendingVideoId) {
              this.loadVideo(this.pendingVideoId, this.pendingStartTime);
              this.pendingVideoId = null;
            }
          },
          onStateChange: (event) => {
            if (this.onStateChangeCallback) {
              this.onStateChangeCallback(event.data);
            }
          },
        },
      });
    } catch (err) {
      console.warn('Could not initialize YT Player:', err);
    }
  }

  public setOnStateChange(cb: (state: number) => void) {
    this.onStateChangeCallback = cb;
  }

  public loadVideo(videoId: string, startTime = 0) {
    this.init();

    if (!this.player || typeof this.player.loadVideoById !== 'function') {

      this.pendingVideoId = videoId;
      this.pendingStartTime = startTime;
      return;
    }

    try {
      this.player.loadVideoById({ videoId, startSeconds: startTime });
    } catch (err) {
      console.warn('Error loading video:', err);
    }
  }

  public play() {
    if (this.player && typeof this.player.playVideo === 'function') {
      this.player.playVideo();
    }
  }

  public pause() {
    if (this.player && typeof this.player.pauseVideo === 'function') {
      this.player.pauseVideo();
    }
  }

  public seekTo(seconds: number) {
    if (this.player && typeof this.player.seekTo === 'function') {
      this.player.seekTo(seconds, true);
    }
  }

  public setVolume(vol: number) {
    // vol is 0 to 1, YT takes 0 to 100
    if (this.player && typeof this.player.setVolume === 'function') {
      this.player.setVolume(Math.round(vol * 100));
    }
  }

  public getCurrentTime(): number {
    if (this.player && typeof this.player.getCurrentTime === 'function') {
      return this.player.getCurrentTime() || 0;
    }
    return 0;
  }

  public getDuration(): number {
    if (this.player && typeof this.player.getDuration === 'function') {
      return this.player.getDuration() || 0;
    }
    return 0;
  }

  public destroy() {
    if (this.player && typeof this.player.destroy === 'function') {
      this.player.destroy();
      this.player = null;
    }
    if (this.containerElement) {
      this.containerElement.remove();
      this.containerElement = null;
    }
  }
}

export const ytAudio = new YouTubeAudioController();
