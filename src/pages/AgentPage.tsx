import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AgentPage() {
  return (
    <div className="min-h-screen bg-void text-starlight pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/tools" className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold/70 hover:text-gold mb-8 inline-block">← The Tools</Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center">
            <Eye className="w-8 h-8 text-gold" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Source-grounded inquiry</p>
            <h1 className="font-display text-4xl md:text-5xl text-gradient-gold">Acuity.Agent</h1>
          </div>
        </div>

        <p className="text-lg text-starlight/70 mb-10 max-w-2xl">
          The inquiry tool that searches the curated corpus and answers from what it actually finds — with citations, provenance and editions kept distinct. When the sources do not hold the answer, it says so.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display text-xl text-gold mb-3">Explore</h2>
            <ul className="space-y-2 text-sm text-starlight/60">
              <li>• Grep, find and cat across the sacred-text library</li>
              <li>• Ancient Wisdom Atlas and public-domain sources</li>
              <li>• Structured passage retrieval with neighbours</li>
              <li>• Chat with search steps shown in real time</li>
            </ul>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display text-xl text-gold mb-3">Synthesise & Interpret</h2>
            <ul className="space-y-2 text-sm text-starlight/60">
              <li>• Final synthesis after broad corpus research</li>
              <li>• Compare themes across traditions</li>
              <li>• Personalised pathways to wisdom</li>
              <li>• Admin mode for usage, sources and logs</li>
            </ul>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="font-display text-2xl mb-4">How it works</h2>
          <p className="text-starlight/70 mb-4">
            The agent is instructed to answer only from files it finds in the sandbox. The sacred-text archive is vendored and mounted. Other sources can be added and synced by administrators. Answers include citations so evidence can be inspected.
          </p>
          <p className="text-starlight/70">
            Available at <a href="https://agent.acuity.institute" className="text-gold hover:underline">agent.acuity.institute</a>. Part of Acuity.One — coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
