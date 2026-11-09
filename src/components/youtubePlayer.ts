export interface YouTubePlayer {
  mute(): void;
  setVolume(volume: number): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getIframe(): HTMLIFrameElement;
  destroy(): void;
}

export interface YouTubeAPI {
  Player: new (element: HTMLElement, options: {
    host: string;
    videoId: string;
    width: string;
    height: string;
    playerVars: Record<string, string | number>;
    events: {
      onReady(event: { target: YouTubePlayer }): void;
      onStateChange(event: { data: number; target: YouTubePlayer }): void;
      onAutoplayBlocked(): void;
      onError(): void;
    };
  }) => YouTubePlayer;
}

type YouTubeWindow = Window & { YT?: YouTubeAPI; onYouTubeIframeAPIReady?: () => void };
let pendingAPI: Promise<YouTubeAPI> | undefined;

/** One deferred API script, shared by the films across client-side navigation. */
export function loadYouTubeAPI(): Promise<YouTubeAPI> {
  const host = window as YouTubeWindow;
  if (host.YT?.Player) return Promise.resolve(host.YT);
  if (pendingAPI) return pendingAPI;
  pendingAPI = new Promise<YouTubeAPI>((resolve, reject) => {
    const previousReady = host.onYouTubeIframeAPIReady;
    const script = document.createElement('script');
    const fail = () => {
      clearTimeout(timeout);
      script.remove();
      host.onYouTubeIframeAPIReady = previousReady;
      reject(new Error('The film service could not be loaded.'));
    };
    const timeout = window.setTimeout(fail, 15000);
    host.onYouTubeIframeAPIReady = () => {
      clearTimeout(timeout);
      host.onYouTubeIframeAPIReady = previousReady;
      if (host.YT?.Player) resolve(host.YT);
      else fail();
      previousReady?.();
    };
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.referrerPolicy = 'strict-origin-when-cross-origin';
    script.addEventListener('error', fail, { once: true });
    document.head.appendChild(script);
  }).catch(error => { pendingAPI = undefined; throw error; });
  return pendingAPI;
}

const films = new Map<string, { pause(): void; sync(): void }>();
let overlayActive = false;
export function filmOverlayActive() { return overlayActive; }
export function setFilmOverlayActive(active: boolean) {
  overlayActive = active;
  films.forEach(film => film.sync());
}
export function registerFilm(id: string, controls: { pause(): void; sync(): void }) {
  films.set(id, controls);
  return () => { films.delete(id); };
}
export function claimFilmPlayback(id: string) {
  films.forEach((film, key) => { if (key !== id) film.pause(); });
}
