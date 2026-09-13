import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';
import { SHORTS_CATALOGUE, type ShortEntry } from '../data/shortsCatalogue';

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ShortsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  const handleClose = useCallback(() => {
    setActiveIndex(0);
    setMuted(true);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const delta = e.key === 'ArrowDown' ? 1 : -1;
        const next = Math.min(
          SHORTS_CATALOGUE.length - 1,
          Math.max(0, activeIndex + delta)
        );
        const el = scrollerRef.current?.children[next] as HTMLElement | undefined;
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, activeIndex, handleClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    scrollerRef.current?.scrollTo({ top: 0 });
    setActiveIndex(0);
    setMuted(true);
  }, [open]);

  if (!open) return null;

  const total = SHORTS_CATALOGUE.length;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-void animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Acuity Shorts"
    >
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 pointer-events-none">
        <div className="pointer-events-auto">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/60 block mb-0.5">
            Library
          </span>
          <h2 className="text-lg font-light text-starlight tracking-tight">
            Shorts
          </h2>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="font-mono text-[10px] text-starlight/35 bg-white/[0.04] px-2 py-0.5 rounded-full">
            {total === 0 ? '0' : `${activeIndex + 1} / ${total}`}
          </span>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-starlight/50 hover:text-starlight bg-black/40 border border-white/[0.08] backdrop-blur-md transition-colors duration-200"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-starlight/50 hover:text-starlight bg-black/40 border border-white/[0.08] backdrop-blur-md transition-colors duration-200"
            aria-label="Close Shorts"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <p className="text-sm text-starlight/40 font-light">
            No Shorts yet. Add entries in{' '}
            <code className="font-mono text-[11px] text-gold/70">src/data/shortsCatalogue.ts</code>.
          </p>
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto snap-y snap-mandatory overscroll-y-contain"
          style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {SHORTS_CATALOGUE.map((short, index) => (
            <ShortSlide
              key={short.id}
              short={short}
              index={index}
              isActive={index === activeIndex}
              muted={muted}
              onBecomeActive={setActiveIndex}
              onToggleMute={() => setMuted((m) => !m)}
            />
          ))}
        </div>
      )}

      {total > 1 && (
        <div className="absolute right-3 bottom-24 z-20 hidden md:flex flex-col gap-2">
          <NavChevron
            direction="up"
            disabled={activeIndex === 0}
            onClick={() => {
              const el = scrollerRef.current?.children[activeIndex - 1] as
                | HTMLElement
                | undefined;
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
          <NavChevron
            direction="down"
            disabled={activeIndex >= total - 1}
            onClick={() => {
              const el = scrollerRef.current?.children[activeIndex + 1] as
                | HTMLElement
                | undefined;
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
        </div>
      )}

      {total > 1 && (
        <p className="absolute bottom-5 inset-x-0 z-20 text-center font-mono text-[9px] uppercase tracking-[0.25em] text-starlight/20 pointer-events-none md:hidden">
          Swipe for next
        </p>
      )}
    </div>
  );
}

function NavChevron({
  direction,
  disabled,
  onClick,
}: {
  direction: 'up' | 'down';
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === 'up' ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 rounded-full flex items-center justify-center text-starlight/50 hover:text-starlight bg-black/40 border border-white/[0.08] backdrop-blur-md transition-colors duration-200 disabled:opacity-25 disabled:pointer-events-none"
      aria-label={direction === 'up' ? 'Previous short' : 'Next short'}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function ShortSlide({
  short,
  index,
  isActive,
  muted,
  onBecomeActive,
  onToggleMute,
}: {
  short: ShortEntry;
  index: number;
  isActive: boolean;
  muted: boolean;
  onBecomeActive: (index: number) => void;
  onToggleMute: () => void;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            onBecomeActive(index);
          }
        }
      },
      { threshold: [0.55, 0.75, 0.9] }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [index, onBecomeActive]);

  const tryPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    video.defaultMuted = true;
    video.muted = muted;
    video.playsInline = true;
    const play = video.play();
    if (play !== undefined) {
      play.catch(() => {
        // Browsers may still block; a later canplay/visibility retry handles it.
      });
    }
  }, [failed, muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;

    if (isActive && !failed) {
      tryPlay();
    } else {
      video.pause();
      if (!isActive) {
        try {
          video.currentTime = 0;
          setCurrent(0);
        } catch {
          // Ignore seek errors on unloaded media.
        }
      }
    }
  }, [isActive, muted, failed, tryPlay]);

  useEffect(() => {
    if (!isActive || failed) return;
    const video = videoRef.current;
    if (!video) return;

    const onReady = () => tryPlay();
    video.addEventListener('loadeddata', onReady);
    video.addEventListener('canplay', onReady);
    return () => {
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('canplay', onReady);
    };
  }, [isActive, failed, tryPlay]);

  const progress = duration > 0 ? Math.min(1, current / duration) : 0;

  return (
    <section
      ref={rootRef}
      className="relative h-[100dvh] w-full shrink-0 snap-start snap-always bg-void overflow-hidden"
      aria-label={short.title}
    >
      {!failed ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={short.src}
          poster={short.poster}
          playsInline
          autoPlay={isActive}
          loop
          muted
          preload={isActive || index <= 1 ? 'auto' : 'metadata'}
          onClick={onToggleMute}
          onError={() => setFailed(true)}
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration;
            if (Number.isFinite(d)) setDuration(d);
            if (isActive) tryPlay();
          }}
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onDurationChange={(e) => {
            const d = e.currentTarget.duration;
            if (Number.isFinite(d)) setDuration(d);
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-void-light px-8 text-center">
          <p className="text-sm text-starlight/40 font-light leading-relaxed">
            Couldn’t load this Short. Check the hosted URL in the catalogue.
          </p>
        </div>
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(9,9,15,0.85) 0%, rgba(9,9,15,0.2) 32%, transparent 55%), linear-gradient(to bottom, rgba(9,9,15,0.55) 0%, transparent 18%)',
        }}
      />

      {/* Subtle progress + duration */}
      <div className="absolute bottom-0 inset-x-0 z-20 px-5 pb-[max(0.65rem,env(safe-area-inset-bottom))] pointer-events-none">
        <div className="flex items-center justify-end mb-1.5">
          {duration > 0 && (
            <span className="font-mono text-[9px] tracking-[0.12em] text-starlight/28 tabular-nums">
              {formatTime(current)}
              <span className="text-starlight/15 mx-1">/</span>
              {formatTime(duration)}
            </span>
          )}
        </div>
        <div className="h-[1.5px] w-full rounded-full bg-white/[0.08] overflow-hidden">
          <div
            className="h-full rounded-full bg-gold/45 transition-[width] duration-150 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 z-10 px-5 pb-[max(2.75rem,calc(env(safe-area-inset-bottom)+2.25rem))] pt-16 pointer-events-none">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold/55 mb-2">
          Acuity Short
        </p>
        <h3 className="text-xl md:text-2xl font-light text-starlight tracking-tight leading-snug max-w-lg">
          {short.title}
        </h3>
        {short.description && (
          <p className="mt-2 text-sm font-light text-starlight/45 leading-relaxed max-w-md line-clamp-3">
            {short.description}
          </p>
        )}
        {muted && isActive && (
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-starlight/22">
            Tap for sound
          </p>
        )}
      </div>
    </section>
  );
}
