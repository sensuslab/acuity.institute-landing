import { Box, Eye, Shield } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const PILLARS = [
  {
    title: 'The Archive',
    icon: Box,
    description:
      'An open reading library of ancient wisdom, philosophy and esoteric traditions. Explore source editions in PDF and EPUB.',
  },
  {
    title: 'The Lens',
    icon: Eye,
    description:
      'In development: ask questions across texts, compare passages and trace answers to their sources.',
  },
  {
    title: 'Taking Action',
    icon: Shield,
    description:
      'Planned: bring your reading and reflections together to support thoughtful action.',
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
            Acuity Tools
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {PILLARS.map((pillar, index) => (
            <PillarCard
              key={pillar.title}
              title={pillar.title}
              icon={pillar.icon}
              description={pillar.description}
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
  visible,
  delay,
}: {
  title: string;
  icon: typeof Box;
  description: string;
  visible: boolean;
  delay: number;
}) {
  return (
    <div
      className={`relative glass-card rounded-2xl p-8 md:p-10 transition-all duration-700 ${
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

      <p className="text-sm text-starlight/60 font-light leading-relaxed">
        {description}
      </p>

      <div className="mt-8 pt-6 border-t border-white/[0.05]">
        {title === 'The Archive' ? <a href="/library/" className="font-mono text-xs uppercase tracking-widest text-gold">Enter the library →</a> : <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70">In development</span>}
      </div>


    </div>
  );
}

