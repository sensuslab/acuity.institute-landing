import { Hexagon } from 'lucide-react';

/** Gold hairline with a centred hexagon, used to separate homepage sections. */
export function GoldDivider() {
  return (
    <div aria-hidden className="relative max-w-6xl mx-auto px-6">
      <div className="relative flex items-center justify-center">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/35 to-gold/50" />
        <Hexagon className="mx-4 w-3.5 h-3.5 text-gold/70" strokeWidth={1.25} />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/35 to-gold/50" />
      </div>
    </div>
  );
}

/** Numbered mono section label, e.g. "01 — The Library". */
export function SectionLabel({ index, children, className = '' }: { index: string; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-gold/70 ${className}`}>
      <span className="text-gold">{index}</span>
      <span aria-hidden className="h-px w-8 bg-gold/40" />
      <span>{children}</span>
    </span>
  );
}

/** Seeded stardust field (static positions, CSS twinkle; disabled by reduced-motion rules). */
export function Stardust({ count = 40, seed = 1 }: { count?: number; seed?: number }) {
  const dots = Array.from({ length: count }, (_, i) => {
    const s = (i + 1) * 7919 * seed;
    return {
      left: `${((s * 13) % 1000) / 10}%`,
      top: `${((s * 17) % 1000) / 10}%`,
      size: ((s % 3) + 1) * 0.7,
      opacity: ((s % 5) + 1) * 0.06,
      duration: 3 + (s % 5),
      gold: s % 4 === 0,
    };
  });
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className={`absolute rounded-full animate-pulse-glow ${d.gold ? 'bg-gold-light' : 'bg-starlight'}`}
          style={{ left: d.left, top: d.top, width: d.size, height: d.size, opacity: d.opacity, animationDuration: `${d.duration}s` }}
        />
      ))}
    </div>
  );
}
