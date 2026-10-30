import { Vault } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WisdomVaultPage() {
  return (
    <div className="min-h-screen bg-void text-starlight pt-28 pb-20 opacity-75">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/tools" className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold/70 hover:text-gold mb-8 inline-block">← The Tools</Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Vault className="w-8 h-8 text-starlight/40" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-starlight/40">Under development</p>
            <h1 className="font-display text-4xl md:text-5xl text-starlight/60">WisdomVault</h1>
          </div>
        </div>

        <p className="text-lg text-starlight/50 mb-10 max-w-2xl leading-relaxed">
          An MCP tool for integrating your own services and applications with the Acuity knowledge library. Read-only access for external tools, with admin capabilities for ingestion.
        </p>

        <div className="glass-card rounded-2xl p-8 border-dashed opacity-80">
          <h2 className="font-display text-2xl mb-4 text-starlight/50">Coming soon</h2>
          <p className="text-starlight/50 mb-4">
            WisdomVault (Acuity.MCP) will provide streamable HTTP and REST access to the knowledge library — scripture, commentary, ebooks and articles. Tools for search, compare, parallels, passage retrieval and ask, with provenance.
          </p>
          <p className="text-sm text-starlight/40">
            See mcp.acuity.institute for tool access. Greyed out in navigation while under development.
          </p>
        </div>
      </div>
    </div>
  );
}
