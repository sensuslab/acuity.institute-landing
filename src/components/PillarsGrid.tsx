import { Box, Eye, Layers, LockKeyhole, Orbit } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const PILLARS = [
  {
    title: 'The Archive',
    icon: Box,
    status: 'Open now',
    description:
      'Discover and read the curated corpus: source editions of ancient wisdom, philosophy and esoteric traditions in PDF, EPUB and plain text.',
  },
  {
    title: 'The Lens',
    icon: Eye,
    status: 'Under development',
    description:
      'Ask questions across the texts, compare sources side by side and inspect the evidence behind every answer.',
  },
  {
    title: 'myVault',
    icon: LockKeyhole,
    status: 'Under development',
    description:
      'Keep your own workspaces: notes, conversations and outputs saved privately, ready to return to.',
  },
  {
    title: 'Context Spheres',
    icon: Orbit,
    status: 'Under development',
    description:
      'Visually organise and explore a workspace, so the connections between ideas and sources become visible.',
  },
  {
    title: 'Studio',
    icon: Layers,
    status: 'Under development',
    description:
      'Generate summaries, study material and audio from the sources you select, always traceable to the texts.',
  },
];

export default function PillarsGrid() {
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <section id="pillars" className="relative py-32 md:py-40 px-6">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className="mb-16 md:mb-20">
          <span
            className={`block font-mono text-[10px] uppercase tracking-[0.3em] text-gold/60 transition-all duration-700 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            Acuity Tools · Under development
          </span>
          <h2
            className={`text-4xl md:text-5xl font-light tracking-tight text-starlight mt-3 transition-all duration-700 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            Instruments of Clarity
          </h2>
          <p
            className={`mt-6 max-w-[60ch] text-[15px] leading-[1.75] text-starlight/50 font-light transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '250ms' }}
          >
            The Archive is open today. Around it, the Institute is building a set of
            instruments for reading more deeply: each one grounded in the sources, and
            each one designed to clarify rather than to conclude.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 md:gap-8">
          {PILLARS.map((pillar, index) => (
            <PillarCard
              key={pillar.title}
              title={pillar.title}
              icon={pillar.icon}
              description={pillar.description}
              status={pillar.status}
              wide={index < 2}
              visible={isVisible}
              delay={200 + index * 150}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarCard({
  title,
  icon: Icon,
  description,
  status,
  wide,
  visible,
  delay,
}: {
  status: string;
  wide: boolean;
  title: string;
  icon: typeof Box;
  description: string;
  visible: boolean;
  delay: number;
}) {
  return (
    <div
      className={`relative glass-card rounded-2xl p-8 md:p-10 flex flex-col ${wide ? 'lg:col-span-3' : 'lg:col-span-2'} transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 rounded-xl bg-gold/[0.08] flex items-center justify-center mb-8">
        <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
      </div>

      <h3 className="text-xl font-normal text-starlight tracking-tight mb-3">
        {title}
      </h3>

      <p className="text-sm text-starlight/60 font-light leading-relaxed flex-1">
        {description}
      </p>

      <div className="mt-8 pt-6 border-t border-white/[0.05]">
        {title === 'The Archive' ? <a href="/library/" className="font-mono text-xs uppercase tracking-widest text-gold">Enter the library →</a> : <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70"><span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-pulse-glow" />{status}</span>}
      </div>


    </div>
  );
}

