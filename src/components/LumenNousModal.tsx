import { useCallback, useEffect, useRef, useState } from 'react';
import { X, ArrowUpRight } from 'lucide-react';

const LUMENNOUS_URL = 'https://lumennous.acuity.institute';
const STORAGE_KEY = 'acuity:lumennous-invite';
const OPEN_DELAY_MS = 3000;

const MOTES = Array.from({ length: 26 }, (_, i) => {
  const seed = (i + 1) * 6151;
  return {
    left: `${((seed * 11) % 1000) / 10}%`,
    top: `${((seed * 23) % 620) / 10}%`,
    size: ((seed % 3) + 1) * 0.7,
    opacity: ((seed % 5) + 2) * 0.06,
    duration: 3 + (seed % 5),
    delay: (seed % 4000) / 1000,
  };
});

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function LumenNousModal() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(STORAGE_KEY) === 'dismissed';
    } catch {
      dismissed = false;
    }
    if (dismissed) return;

    const timer = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'dismissed');
    } catch {
      // Storage unavailable (private mode) — the modal simply shows again next load.
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }, 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      );
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      if (restoreFocusRef.current instanceof HTMLElement) {
        restoreFocusRef.current.focus();
      }
    };
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lumennous-title"
      aria-describedby="lumennous-description"
    >
      <div
        className="absolute inset-0 bg-void/90 backdrop-blur-md animate-fade-in"
        onClick={handleClose}
      />

      <div
        className="absolute inset-0 pointer-events-none animate-fade-in"
        style={{
          background:
            'radial-gradient(ellipse at 50% 38%, rgba(124,92,224,0.14) 0%, rgba(212,168,67,0.05) 38%, transparent 68%)',
        }}
      />

      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-[26rem] max-h-full overflow-y-auto rounded-[28px] border border-white/[0.09] animate-lumen-in"
        style={{
          background:
            'linear-gradient(180deg, #171426 0%, #0e0c1a 52%, #09090f 100%)',
          boxShadow:
            '0 0 90px rgba(124,92,224,0.18), 0 0 160px rgba(212,168,67,0.07), 0 32px 64px -24px rgba(0,0,0,0.9)',
        }}
      >
        <div className="relative overflow-hidden rounded-[28px]">
          <LightColumn />

          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center text-starlight/40 hover:text-starlight hover:bg-white/[0.07] transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 px-7 pt-12 pb-8 text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/60">
              Now Live
            </span>

            <h2
              id="lumennous-title"
              className="mt-5 font-display text-5xl md:text-[3.4rem] leading-none tracking-tight text-starlight"
              style={{
                textShadow:
                  '0 0 24px rgba(232,201,106,0.45), 0 0 60px rgba(212,168,67,0.22)',
              }}
            >
              LumenNous
            </h2>

            <div className="mt-7 flex justify-center">
              <Sigil />
            </div>

            <p className="mt-7 font-display text-lg tracking-wide text-starlight/70">
              Personal Prayer &amp; Cosmic Consciousness
            </p>

            <p
              id="lumennous-description"
              className="mt-4 text-sm font-light leading-relaxed text-starlight/45"
            >
              A prayer engine drawn from a library of seventy-two prayers and
              guided practices &mdash; a daily contemplation, three-minute
              methods, or a practice assembled around what you are carrying.
            </p>

            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-starlight/25">
              No account. Nothing to track. Just this moment.
            </p>

            <a
              href={LUMENNOUS_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-autofocus
              onClick={handleClose}
              className="group mt-8 inline-flex items-center justify-center gap-2 w-full px-8 py-3.5 rounded-full border border-gold/50 text-gold font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:bg-gold/10 hover:border-gold hover:shadow-[0_0_34px_rgba(212,168,67,0.2)]"
            >
              Enter LumenNous
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <button
              onClick={handleClose}
              className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-starlight/30 hover:text-starlight/60 transition-colors duration-200"
            >
              Not now
            </button>

            <div className="mt-7 pt-5 border-t border-white/[0.06]">
              <span className="font-mono text-[10px] text-starlight/20">
                lumennous.acuity.institute
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LightColumn() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[58%] h-[78%] blur-2xl animate-pulse-glow"
        style={{
          background:
            'linear-gradient(180deg, rgba(250,250,250,0.5) 0%, rgba(232,201,106,0.3) 22%, rgba(148,163,224,0.22) 52%, rgba(124,92,224,0.1) 76%, transparent 100%)',
          animationDuration: '7s',
        }}
      />

      <div
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-[22%] h-[62%] blur-xl"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.16) 45%, transparent 100%)',
        }}
      />

      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[92%] aspect-square rounded-full blur-3xl animate-pulse-glow"
        style={{
          background:
            'radial-gradient(circle, rgba(232,201,106,0.16) 0%, rgba(124,92,224,0.08) 45%, transparent 72%)',
          animationDuration: '9s',
        }}
      />

      {MOTES.map((mote, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-starlight animate-pulse-glow"
          style={{
            left: mote.left,
            top: mote.top,
            width: `${mote.size}px`,
            height: `${mote.size}px`,
            opacity: mote.opacity,
            animationDuration: `${mote.duration}s`,
            animationDelay: `${mote.delay}s`,
          }}
        />
      ))}

      <div
        className="absolute bottom-0 left-0 right-0 h-24"
        style={{ background: 'linear-gradient(to bottom, transparent, #09090f)' }}
      />
    </div>
  );
}

function Sigil() {
  return (
    <div className="relative w-28 h-28">
      <div
        className="absolute -inset-6 rounded-full blur-2xl animate-pulse-glow"
        style={{
          background:
            'radial-gradient(circle, rgba(232,201,106,0.3) 0%, rgba(124,92,224,0.12) 50%, transparent 72%)',
          animationDuration: '5s',
        }}
      />

      <svg viewBox="0 0 120 120" className="relative w-full h-full" fill="none">
        <defs>
          <linearGradient id="lnStrandWarm" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8c96a" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#d4a843" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#a07d2e" stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id="lnStrandCool" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fafafa" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#9db4e8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#7c5ce0" stopOpacity="0.3" />
          </linearGradient>
          <radialGradient id="lnCore" cx="0.5" cy="0.42" r="0.55">
            <stop offset="0%" stopColor="#e8c96a" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#7c5ce0" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#09090f" stopOpacity="0" />
          </radialGradient>
          <filter id="lnGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="60" cy="60" r="52" stroke="#d4a843" strokeWidth="0.4" opacity="0.14" />
        <circle cx="60" cy="60" r="45" stroke="#7c5ce0" strokeWidth="0.4" opacity="0.12" />

        <circle cx="60" cy="60" r="37" fill="url(#lnCore)" />
        <circle cx="60" cy="60" r="37" stroke="url(#lnStrandWarm)" strokeWidth="1.1" opacity="0.75" />

        <g filter="url(#lnGlow)">
          <ellipse
            cx="60"
            cy="60"
            rx="14"
            ry="37"
            stroke="url(#lnStrandWarm)"
            strokeWidth="1.1"
            transform="rotate(28 60 60)"
          />
          <ellipse
            cx="60"
            cy="60"
            rx="26"
            ry="37"
            stroke="url(#lnStrandCool)"
            strokeWidth="0.9"
            transform="rotate(28 60 60)"
          />
          <ellipse
            cx="60"
            cy="60"
            rx="14"
            ry="37"
            stroke="url(#lnStrandCool)"
            strokeWidth="1"
            transform="rotate(-28 60 60)"
          />
          <ellipse
            cx="60"
            cy="60"
            rx="26"
            ry="37"
            stroke="url(#lnStrandWarm)"
            strokeWidth="0.9"
            transform="rotate(-28 60 60)"
          />

          <path
            d="M 60 34 a 9 9 0 1 1 -8.5 6.2 a 5.5 5.5 0 1 0 5.2 -3.8"
            stroke="url(#lnStrandWarm)"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <path
            d="M 60 86 a 9 9 0 1 1 8.5 -6.2 a 5.5 5.5 0 1 0 -5.2 3.8"
            stroke="url(#lnStrandWarm)"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </g>

        <circle cx="60" cy="60" r="3" fill="#fafafa" opacity="0.55">
          <animate
            attributeName="opacity"
            values="0.35;0.8;0.35"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      <div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[190%] h-6 blur-xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(232,201,106,0.16) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
