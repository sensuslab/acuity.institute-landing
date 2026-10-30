import { Box, Eye, Layers, LockKeyhole, Orbit, type LucideIcon } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { SectionLabel, Stardust } from './SectionChrome';

type Facet = { title: string; icon: LucideIcon; description: string };

const FACETS: Facet[] = [
  { title: 'The Archive', icon: Box, description: 'Discover and read the curated corpus, the whole of the Library held within the instrument.' },
  { title: 'The Lens', icon: Eye, description: 'Ask questions, compare sources and inspect the evidence behind every answer.' },
  { title: 'myVault', icon: LockKeyhole, description: 'Keep personal workspaces: notes, conversations and outputs, saved privately.' },
  { title: 'Context Spheres', icon: Orbit, description: 'Visually organise and explore a workspace, so connections between ideas become visible.' },
  { title: 'Studio', icon: Layers, description: 'Generate summaries, study material and audio from the sources you select.' },
];

export default function PillarsGrid() {
  const { ref, isVisible } = useScrollReveal(0.05);
  const fade = (d = 0) => ({
    className: `transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`,
    style: { transitionDelay: `${d}ms` },
  });

  return (
    <section id="pillars" aria-labelledby="pillars-title" className="relative py-28 md:py-36 overflow-hidden">
      {/* Gold-lit atmosphere: god-rays from above, warm floor glow */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 55% 40% at 50% 42%, rgba(212,168,67,0.13) 0%, transparent 70%), linear-gradient(180deg, #09090f 0%, #0d0b10 50%, #09090f 100%)' }} />
      <div aria-hidden className="absolute top-0 left-1/2 w-[70%] h-[75%] pointer-events-none animate-ray" style={{ background: 'conic-gradient(from 180deg at 50% 0%, transparent 155deg, rgba(232,201,106,0.07) 168deg, transparent 176deg, rgba(232,201,106,0.1) 184deg, transparent 192deg, rgba(232,201,106,0.06) 200deg, transparent 210deg)', filter: 'blur(6px)' }} />
      <Stardust count={36} seed={5} />

      <div ref={ref} className="relative max-w-6xl mx-auto px-6">
        <div className="text-center">
          <div {...fade(0)}><SectionLabel index="03">Acuity Tools · Under development</SectionLabel></div>
          <h2 id="pillars-title" className={`mt-6 font-display font-light text-[46px] md:text-[72px] leading-[1.02] tracking-tight text-starlight ${fade(100).className}`} style={fade(100).style}>
            Instruments <span className="italic text-gradient-gold">of Clarity</span>
          </h2>
          <p className={`mt-6 mx-auto max-w-[60ch] text-[15px] leading-[1.75] text-starlight/55 font-light ${fade(200).className}`} style={fade(200).style}>
            One instrument for self-exploration and creation, now being built. It brings together
            everything the Institute offers: the texts of the Library and the inquiry of
            Acuity.Agent, gathered into a single interface where reading, reflection and the
            making of new material happen in one place.
          </p>
        </div>

        {/* Lineage: Library + Agent -> Instruments of Clarity */}
        <div className={`mt-14 ${fade(300).className}`} style={fade(300).style} aria-label="Instruments of Clarity grows from the Library and Acuity.Agent">
          <div className="mx-auto max-w-xl grid grid-cols-2 gap-6">
            <SeedNode label="The Library" note="The texts" />
            <SeedNode label="Acuity.Agent" note="The inquiry" />
          </div>
          <svg aria-hidden viewBox="0 0 400 60" className="mx-auto block w-full max-w-xl h-[60px]" fill="none">
            <defs>
              <linearGradient id="lineageG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4a843" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#e8c96a" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path d="M100 0 C100 35, 200 25, 200 60" stroke="url(#lineageG)" strokeWidth="1" />
            <path d="M300 0 C300 35, 200 25, 200 60" stroke="url(#lineageG)" strokeWidth="1" />
          </svg>
        </div>

        {/* Emblem with five facets around it */}
        <div className="mt-2 grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,360px)_1fr] gap-6 lg:gap-8 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <FacetCard facet={FACETS[0]} n={1} {...fade(450)} align="right" />
            <FacetCard facet={FACETS[1]} n={2} {...fade(550)} align="right" />
          </div>
          <div className={`order-1 lg:order-2 ${fade(400).className}`} style={fade(400).style}>
            <Emblem />
          </div>
          <div className="order-3 space-y-6">
            <FacetCard facet={FACETS[2]} n={3} {...fade(650)} />
            <FacetCard facet={FACETS[3]} n={4} {...fade(750)} />
          </div>
        </div>
        <div className="mt-6 mx-auto max-w-md">
          <FacetCard facet={FACETS[4]} n={5} {...fade(850)} align="center" />
        </div>
      </div>
    </section>
  );
}

function SeedNode({ label, note }: { label: string; note: string }) {
  return (
    <div className="glow-panel rounded-full px-5 py-3 text-center">
      <div className="font-display text-[19px] text-starlight leading-none">{label}</div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-gold/60">{note}</div>
    </div>
  );
}

function FacetCard({ facet, n, className, style, align = 'left' }: { facet: Facet; n: number; className: string; style: React.CSSProperties; align?: 'left' | 'right' | 'center' }) {
  const Icon = facet.icon;
  const alignCls = align === 'right' ? 'lg:text-right lg:flex-row-reverse' : align === 'center' ? 'sm:text-center sm:flex-col sm:items-center' : '';
  return (
    <div className={`glow-panel rounded-2xl p-6 flex gap-5 ${alignCls} ${className}`} style={style}>
      <div className="shrink-0 w-11 h-11 rounded-xl border border-gold/35 bg-gold/[0.06] flex items-center justify-center">
        <Icon className="w-5 h-5 text-gold" strokeWidth={1.3} />
      </div>
      <div>
        <div className={`flex items-baseline gap-3 ${align === 'right' ? 'lg:justify-end' : align === 'center' ? 'sm:justify-center' : ''}`}>
          <span className="font-mono text-[10px] text-gold/60">0{n}</span>
          <h3 className="text-[18px] text-starlight tracking-tight">{facet.title}</h3>
        </div>
        <p className="mt-2 text-[13.5px] text-starlight/55 font-light leading-relaxed">{facet.description}</p>
        <span className={`mt-3 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-gold/70`}>
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-pulse-glow" />
          Under development
        </span>
      </div>
    </div>
  );
}

/** Glowing gold archway inside a wireframe hexagon, crowned with an orb. */
function Emblem() {
  return (
    <div className="relative mx-auto w-full max-w-[320px] aspect-[4/5]" role="img" aria-label="The Instruments of Clarity emblem: a glowing archway within a hexagon">
      <div aria-hidden className="absolute inset-[10%] rounded-full blur-3xl animate-pulse-glow" style={{ background: 'radial-gradient(circle, rgba(232,201,106,0.35) 0%, rgba(212,168,67,0.12) 45%, transparent 72%)', animationDuration: '6s' }} />
      <svg viewBox="0 0 240 300" className="relative w-full h-full" fill="none">
        <defs>
          <linearGradient id="archG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff6d8" />
            <stop offset="45%" stopColor="#e8c96a" />
            <stop offset="100%" stopColor="#a07d2e" />
          </linearGradient>
          <radialGradient id="doorG" cx="50%" cy="85%" r="70%">
            <stop offset="0%" stopColor="#fff2c4" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#e8c96a" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#d4a843" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Wireframe hexagonal prism */}
        <g stroke="#d4a843" strokeOpacity="0.45" strokeWidth="0.8">
          <polygon points="120,22 205,70 205,190 120,238 35,190 35,70" />
          <polygon points="120,42 188,80 188,182 120,220 52,182 52,80" strokeOpacity="0.3" />
          <line x1="120" y1="22" x2="120" y2="42" /><line x1="205" y1="70" x2="188" y2="80" />
          <line x1="205" y1="190" x2="188" y2="182" /><line x1="120" y1="238" x2="120" y2="220" />
          <line x1="35" y1="190" x2="52" y2="182" /><line x1="35" y1="70" x2="52" y2="80" />
        </g>
        {/* Floor grid */}
        <g stroke="#d4a843" strokeOpacity="0.25" strokeWidth="0.6">
          <line x1="10" y1="262" x2="230" y2="262" />
          <line x1="40" y1="280" x2="200" y2="280" strokeOpacity="0.15" />
          <line x1="120" y1="240" x2="40" y2="300" /><line x1="120" y1="240" x2="200" y2="300" />
          <line x1="120" y1="240" x2="120" y2="300" />
        </g>
        {/* Door light */}
        <path d="M92 228 V138 a28 28 0 0 1 56 0 V228 Z" fill="url(#doorG)" />
        {/* Arches */}
        <g filter="url(#glow)" strokeLinecap="round">
          <path d="M78 232 V136 a42 42 0 0 1 84 0 V232" stroke="url(#archG)" strokeWidth="5" />
          <path d="M92 230 V138 a28 28 0 0 1 56 0 V230" stroke="url(#archG)" strokeWidth="1.6" strokeOpacity="0.8" />
        </g>
        {/* Orb */}
        <circle cx="120" cy="22" r="7" fill="#fff6d8" filter="url(#glow)" />
        <circle cx="120" cy="22" r="14" fill="#e8c96a" fillOpacity="0.18" />
        {/* Light pool */}
        <ellipse cx="120" cy="236" rx="60" ry="6" fill="#e8c96a" fillOpacity="0.35" filter="url(#glow)" />
      </svg>
    </div>
  );
}
