const ENTITIES = [
  'Discernment',
  'Perspicacity',
  'Lucidity',
  'Sagacity',
  'Precision',
  'Foresight',
  'Keenness',
  'Insight',
];

export default function TrustConstellation() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />

      <div className="text-center mb-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-starlight/20">
          Constellation of Trust
        </span>
      </div>

      <div className="relative">
        <div className="flex animate-marquee">
          {[...ENTITIES, ...ENTITIES].map((name, i) => (
            <div key={i} className="flex items-center shrink-0">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-starlight/25 px-8 md:px-12 whitespace-nowrap">
                {name}
              </span>
              <span className="w-1 h-1 rounded-full bg-gold/20 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
    </section>
  );
}
