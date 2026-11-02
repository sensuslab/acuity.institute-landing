import { useEffect, useId, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { featureFilms, type FeatureFilmId } from '../data/featureFilms';
import './scroll-film.css';

type Playback = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

/** Self-hosted editorial films: no controls, play on scroll, muted by default, click to unmute. */
export default function ScrollFilm({ film, compact = false }: { film: FeatureFilmId; compact?: boolean }) {
  const entry = featureFilms[film];
  const id = useId();
  const screen = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playback, setPlayback] = useState<Playback>('idle');
  const [muted, setMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const target = screen.current;
    const el = video.current;
    if (!target || !el) return;

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let visible = false;
    let reduced = preference.matches;
    let userPaused = false;

    const canPlay = () => visible && !document.hidden && !userPaused && !reduced;

    const pause = () => {
      if (disposed) return;
      el.pause();
      setPlayback('paused');
    };

    const play = async () => {
      if (disposed || !canPlay()) return;
      try {
        el.muted = muted;
        await el.play();
        setPlayback('playing');
      } catch {
        setPlayback('paused');
      }
    };

    const sync = () => {
      if (canPlay()) void play();
      else pause();
    };

    const onIntersect = (entries: IntersectionObserverEntry[]) => {
      visible = entries.some(e => e.isIntersecting && e.intersectionRatio > 0.4);
      sync();
    };

    const observer = new IntersectionObserver(onIntersect, { threshold: [0, 0.4, 0.6, 1] });
    observer.observe(target);

    const onVisibility = () => sync();
    const onMotion = () => {
      reduced = preference.matches;
      sync();
    };

    el.addEventListener('play', () => !disposed && setPlayback('playing'));
    el.addEventListener('pause', () => !disposed && setPlayback('paused'));
    el.addEventListener('error', () => !disposed && setPlayback('error'));
    el.addEventListener('loadstart', () => !disposed && setPlayback('loading'));

    document.addEventListener('visibilitychange', onVisibility);
    preference.addEventListener('change', onMotion);

    // Initial sync after mount
    requestAnimationFrame(sync);

    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      preference.removeEventListener('change', onMotion);
      el.pause();
    };
  }, [muted, film]);

  const toggleMute = () => {
    const el = video.current;
    if (!el) return;
    const next = !muted;
    setMuted(next);
    el.muted = next;
    setHasInteracted(true);
    if (!next) {
      // Unmuting may require user gesture; play if paused
      el.play().catch(() => {});
    }
  };

  const onVideoClick = (e: React.MouseEvent) => {
    // Prevent any default, just toggle mute
    e.preventDefault();
    toggleMute();
  };

  return (
    <figure
      id={'film-' + film}
      className={'scroll-film' + (compact ? ' scroll-film-compact' : '')}
      data-film={film}
      data-playback={playback}
      aria-labelledby={id + '-caption'}
    >
      <div className="scroll-film-screen" ref={screen} onClick={onVideoClick}>
        <video
          ref={video}
          className="scroll-film-video"
          src={entry.src}
          poster={entry.poster}
          muted={muted}
          playsInline
          loop
          preload="metadata"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          aria-label={entry.label + ' — silent film, click to ' + (muted ? 'unmute' : 'mute')}
        />
        {!hasInteracted && muted && (
          <div className="scroll-film-unmute-hint" aria-hidden="true">
            <VolumeX size={20} />
            <span>Click to unmute</span>
          </div>
        )}
      </div>
      <figcaption id={id + '-caption'}>
        <div className="scroll-film-caption">
          <span>{entry.label}</span>
          <p>{entry.title}</p>
        </div>
        <div className="scroll-film-actions">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute film' : 'Mute film'}
            className="scroll-film-mute-toggle"
          >
            {muted ? <VolumeX size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
            <span>{muted ? 'Sound off' : 'Sound on'}</span>
          </button>
        </div>
      </figcaption>
      {playback === 'error' && (
        <p className="scroll-film-note" role="status">The film could not load.</p>
      )}
    </figure>
  );
}
