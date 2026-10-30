import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-void text-starlight pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/tools" className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold/70 hover:text-gold mb-8 inline-block">← The Tools</Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center">
            <Search className="w-8 h-8 text-gold" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Federated research</p>
            <h1 className="font-display text-4xl md:text-5xl text-gradient-gold">Acuity.Search</h1>
          </div>
        </div>

        <p className="text-lg text-starlight/70 mb-10 max-w-2xl leading-relaxed">
          Web, literature and collections research with verbatim evidence. Modes for General, Literature (edition-aware) and Collections. Optional synthesis and signed handoff into Acuity.Codex.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {['General', 'Literature', 'Collections'].map((mode) => (
            <div key={mode} className="glass-card rounded-xl p-4 text-center">
              <h3 className="font-display text-sm text-gold">{mode}</h3>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="font-display text-2xl mb-4">Explore & Synthesise</h2>
          <p className="text-starlight/70 mb-4">
            Uncensored search across sources, with quality tiers, re-ranking and streamed synthesis. Results can be added to Codex spheres for further organisation and interpretation. Privacy-focused: model details and provider errors stay server-side.
          </p>
          <p className="text-starlight/70">
            Available at <a href="https://search.acuity.institute" className="text-gold hover:underline" target="_blank" rel="noopener">search.acuity.institute</a>. Part of Acuity.One — coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
