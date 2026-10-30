import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CodexPage() {
  return (
    <div className="min-h-screen bg-void text-starlight pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/tools" className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold/70 hover:text-gold mb-8 inline-block">← The Tools</Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gold" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Instruments of Clarity</p>
            <h1 className="font-display text-4xl md:text-5xl text-gradient-gold">Acuity.Codex</h1>
          </div>
        </div>

        <p className="text-lg text-starlight/70 mb-10 max-w-2xl leading-relaxed">
          Organise, interpret and create. Archive for discovery, Context Spheres for knowledge bases, The Lens for evidence-based inquiry, myVault for private notes, and Studio for summaries and audio.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {['The Archive', 'Context Spheres', 'The Lens', 'myVault', 'Studio'].map((item) => (
            <div key={item} className="glass-card rounded-xl p-4 text-center">
              <h3 className="font-display text-sm text-gold">{item}</h3>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="font-display text-2xl mb-4">Personalise & Create</h2>
          <p className="text-starlight/70 mb-4">
            Build separate knowledge bases, save camera views, generate study material, and produce podcasts with multiple voices. Embed research from Acuity.Search and hand off results into spheres.
          </p>
          <p className="text-starlight/70">
            Available at <a href="https://codex.acuity.institute" className="text-gold hover:underline" target="_blank" rel="noopener">codex.acuity.institute</a>. Part of Acuity.One — coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
