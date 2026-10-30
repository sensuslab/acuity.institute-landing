import { Library } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-void text-starlight pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/tools" className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold/70 hover:text-gold mb-8 inline-block">← The Tools</Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center">
            <Library className="w-8 h-8 text-gold" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Live now</p>
            <h1 className="font-display text-4xl md:text-5xl text-gradient-gold">The Library</h1>
          </div>
        </div>

        <p className="text-lg text-starlight/70 mb-10 max-w-2xl leading-relaxed">
          The curated corpus of sacred texts, ebooks and articles. Open access virtual e-reader with presentation mode. Built from public-domain sources including the Internet Sacred Text Archive, American Standard Version, Berean Standard Bible, and 281 texts from the Ancient Wisdom Atlas.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display text-xl text-gold mb-3">Consume</h2>
            <ul className="space-y-2 text-sm text-starlight/60">
              <li>• Virtual e-reader with adjustable reading</li>
              <li>• Presentation mode for study and teaching</li>
              <li>• Full attribution and edition records</li>
              <li>• Searchable plain text, HTML and USX</li>
            </ul>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display text-xl text-gold mb-3">Materials</h2>
            <ul className="space-y-2 text-sm text-starlight/60">
              <li>• Sacred texts archive (vendored)</li>
              <li>• Ancient Wisdom Atlas public-domain texts</li>
              <li>• World mythology, folklore, scripture</li>
              <li>• Open access with proper rights notices</li>
            </ul>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="font-display text-2xl mb-4">Currently on the home menu</h2>
          <p className="text-starlight/70">
            The Library is live and forms the knowledge base for Acuity.Agent and related tools. Explore the corpus, read in presentation mode, and use it as the foundation for personal practice and synthesis.
          </p>
        </div>
      </div>
    </div>
  );
}
