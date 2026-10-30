import { Hexagon, Eye, BookOpen, Library, Search, Vault } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ToolsIndex() {
  return (
    <div className="min-h-screen bg-void text-starlight pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold mb-4">Beyond the Horizon of Knowledge</p>
          <h1 className="font-display text-5xl md:text-7xl text-gradient-gold mb-6">The Tools</h1>
          <p className="text-lg text-starlight/70 max-w-2xl mx-auto">
            Instruments for exploring, consuming, synthesising, personalising and interpreting uncensored knowledge and esoteric wisdom. Pathways to personal development, practice, inspiration, unity and harmony.
          </p>
          <p className="mt-4 text-sm text-gold/80">All services under Acuity.One — coming soon, except the Library which is live now.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/tools/agent" className="glass-card rounded-2xl p-6 hover:border-gold/30 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-gold" />
              </div>
              <h2 className="font-display text-xl">Acuity.Agent</h2>
            </div>
            <p className="text-sm text-starlight/60">Source-grounded inquiry. Search the curated corpus with citations and provenance.</p>
          </Link>

          <Link to="/tools/codex" className="glass-card rounded-2xl p-6 hover:border-gold/30 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-gold" />
              </div>
              <h2 className="font-display text-xl">Acuity.Codex</h2>
            </div>
            <p className="text-sm text-starlight/60">Instruments of Clarity: Archive, Context Spheres, The Lens, myVault, Studio.</p>
          </Link>

          <Link to="/tools/library" className="glass-card rounded-2xl p-6 hover:border-gold/30 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <Library className="w-6 h-6 text-gold" />
              </div>
              <h2 className="font-display text-xl">The Library</h2>
            </div>
            <p className="text-sm text-starlight/60">Curated corpus of sacred texts, ebooks and articles. Live now — virtual e-reader, open access, presentation mode.</p>
          </Link>

          <Link to="/tools/search" className="glass-card rounded-2xl p-6 hover:border-gold/30 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <Search className="w-6 h-6 text-gold" />
              </div>
              <h2 className="font-display text-xl">Acuity.Search</h2>
            </div>
            <p className="text-sm text-starlight/60">Federated research across web, literature and collections. Verbatim evidence and optional synthesis.</p>
          </Link>

          <div className="glass-card rounded-2xl p-6 opacity-50 border-dashed cursor-not-allowed">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Vault className="w-6 h-6 text-starlight/40" />
              </div>
              <h2 className="font-display text-xl text-starlight/40">WisdomVault</h2>
            </div>
            <p className="text-sm text-starlight/40">MCP tool for integrating your own services and applications. Under development.</p>
            <span className="text-xs font-mono uppercase tracking-wider text-starlight/30 mt-2 inline-block">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
