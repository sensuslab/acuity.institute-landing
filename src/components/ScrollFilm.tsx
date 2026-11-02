import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Pause, Play, VolumeX } from 'lucide-react';
import { featureFilms, type FeatureFilmId } from '../data/featureFilms';
import { claimFilmPlayback, filmOverlayActive, loadYouTubeAPI, registerFilm, type YouTubePlayer } from './youtubePlayer';
import './scroll-film.css';

type Playback = 'idle' | 'loading' | 'buffering' | 'playing' | 'paused' | 'blocked' | 'error';

/** Silent editorial films; the YouTube player itself is never cropped or covered. */
export default function ScrollFilm({ film, compact = false }: { film: FeatureFilmId; compact?: boolean }) {
  const entry = featureFilms[film];
  const id = useId();
  const screen = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const toggle = useRef<() => void>(() => {});
  const [playback, setPlayback] = useState<Playback>('idle');
  const [hasPlayer, setHasPlayer] = useState(false);

  useEffect(() => {
    const target = screen.current;
    const container = mount.current;
    if (!target || !container) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let player: YouTubePlayer | undefined;
    let ready = false;
    let loading = false;
    let visible = false;
    let near = false;
    let reduced = preference.matches;
    let userPaused = false;
    let userStarted = false;
    let blocked = false;
    let playing = false;
    let readyTimeout: number | undefined;

    const canPlay = () => visible && !document.hidden && !filmOverlayActive() && !userPaused && !blocked && (!reduced || userStarted);

    const pause = () => {
      if (!ready) return;
      player?.pauseVideo();
      playing = false;
      setPlayback(blocked ? 'blocked' : 'paused');
    };
    const play = () => {
      if (!ready || !player) return;
      claimFilmPlayback(id);
      player.mute();
      player.setVolume(0);
      player.playVideo();
    };
    const sync = () => {
      if (canPlay()) play();
      else pause();
    };
    const failed = () => {
      if (disposed) return;
      clearTimeout(readyTimeout);
      ready = false;
      loading = false;
      playing = false;
      blocked = false;
      player?.destroy();
      player = undefined;
      setHasPlayer(false);
      setPlayback('error');
    };
    const initialise = async () => {
      if (loading || player || disposed) return;
      loading = true;
      setPlayback('loading');
      try {
        const api = await loadYouTubeAPI();
        if (disposed) return;
        const slot = document.createElement('div');
        container.replaceChildren(slot);
        player = new api.Player(slot, {
          host: 'https://www.youtube-nocookie.com', videoId: entry.videoId, width: '100%', height: '100%',
          playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, fs: 0, rel: 0, start: entry.start, origin: window.location.origin },
          events: {
            onReady: event => {
              if (disposed) return;
              clearTimeout(readyTimeout);
              player = event.target;
              ready = true;
              loading = false;
              const iframe = player.getIframe();
              iframe.title = entry.label + ' — silent film';
              iframe.referrerPolicy = 'strict-origin-when-cross-origin';
              iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
              player.mute();
              player.setVolume(0);
              setPlayback('paused');
              sync();
            },
            onStateChange: event => {
              if (disposed) return;
              playing = event.data === 1 || event.data === 3;
              if (event.data === 1) {
                // A native player interaction also respects the active film and silent presentation.
                claimFilmPlayback(id);
                event.target.mute();
                if (!canPlay()) pause();
                else setPlayback('playing');
              } else if (event.data === 3) {
                if (!canPlay()) pause();
                else setPlayback('buffering');
              }
              else if (event.data === 2) setPlayback(blocked ? 'blocked' : 'paused');
              else if (event.data === 0) { event.target.seekTo(entry.start, true); sync(); }
            },
            onAutoplayBlocked: () => { if (!disposed) { playing = false; blocked = true; setPlayback('blocked'); } },
            onError: failed,
          },
        });
        const iframe = player.getIframe();
        iframe.title = entry.label + ' — silent film';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
        setHasPlayer(true);
        readyTimeout = window.setTimeout(failed, 15000);
      } catch { failed(); }
    };
    toggle.current = () => {
      if (playing) { userPaused = true; pause(); return; }
      userPaused = false;
      userStarted = true;
      blocked = false;
      if (!player) void initialise();
      else if (!document.hidden && !filmOverlayActive()) play();
    };

    const unregister = registerFilm(id, { pause, sync });
    const nearby = new IntersectionObserver(entries => {
      near = entries.some(item => item.isIntersecting);
      if (near && !reduced) void initialise();
    }, { rootMargin: '300px 0px' });
    const viewport = new IntersectionObserver(entries => {
      visible = entries.some(item => item.isIntersecting && item.intersectionRatio > 0.5);
      sync();
    }, { threshold: [0, 0.5, 0.55, 1] });
    const motionChanged = () => {
      reduced = preference.matches;
      if (reduced) userStarted = false;
      else if (near) void initialise();
      sync();
    };
    nearby.observe(target);
    viewport.observe(target);
    preference.addEventListener('change', motionChanged);
    document.addEventListener('visibilitychange', sync);
    return () => {
      disposed = true;
      clearTimeout(readyTimeout);
      nearby.disconnect(); viewport.disconnect(); unregister();
      preference.removeEventListener('change', motionChanged);
      document.removeEventListener('visibilitychange', sync);
      player?.destroy();
      container.replaceChildren();
      toggle.current = () => {};
    };
  }, [entry.videoId, entry.label, entry.start, id]);

  const watchUrl = 'https://www.youtube.com/watch?v=' + entry.videoId + (entry.start ? '&t=' + entry.start + 's' : '');
  const active = playback === 'playing' || playback === 'buffering';
  return <figure id={'film-' + film} className={'scroll-film' + (compact ? ' scroll-film-compact' : '')} data-film={film} data-playback={playback} aria-labelledby={id + '-caption'}>
    <div className="scroll-film-screen" ref={screen}>
      {!hasPlayer ? <img className="scroll-film-poster" src={'https://i.ytimg.com/vi/' + entry.videoId + '/hqdefault.jpg'} alt="" loading="lazy" width="480" height="360" /> : null}
      <div className="scroll-film-player" ref={mount} hidden={!hasPlayer} />
    </div>
    <figcaption id={id + '-caption'}>
      <div className="scroll-film-caption"><span>{entry.label}</span><p>{entry.title}</p></div>
      <div className="scroll-film-actions">
        <span className="scroll-film-muted"><VolumeX size={12} aria-hidden="true" />Sound off</span>
        <button type="button" onClick={() => toggle.current()} aria-label={(active ? 'Pause' : 'Play') + ' film: ' + entry.label} disabled={playback === 'loading'}>
          {active ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}<span>{active ? 'Pause' : playback === 'loading' ? 'Loading' : 'Play'}</span>
        </button>
        <a href={watchUrl} target="_blank" rel="noopener noreferrer" aria-label={'Watch ' + entry.label + ' on YouTube (opens in a new tab)'}>Watch film<ArrowUpRight size={12} aria-hidden="true" /></a>
      </div>
    </figcaption>
    {playback === 'blocked' || playback === 'error' ? <p className="scroll-film-note" role="status">{playback === 'blocked' ? 'Select Play to start the silent film.' : 'The film could not load here. Try Play again, or watch it on YouTube.'}</p> : null}
  </figure>;
}
