import { useState, useEffect } from 'react';
import { Hexagon, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Library', href: '/library/' },
  { label: 'Philosophy', href: '#manifesto' },
  { label: 'Webinars', href: '#', action: 'webinars' as const },
  { label: 'Shorts', href: '#', action: 'shorts' as const },
];

const TOOLS = [
  { label: 'Agent', to: '/tools/agent' },
  { label: 'Codex', to: '/tools/codex' },
  { label: 'Library', to: '/tools/library' },
  { label: 'Search', to: '/tools/search' },
  { label: 'WisdomVault', to: '/tools/wisdomvault', disabled: true },
];

export default function Navigation({
  onWebinarsClick,
  onShortsClick,
}: {
  onWebinarsClick: () => void;
  onShortsClick: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div
        className={`flex items-center gap-2 md:gap-8 px-3 md:px-8 py-2.5 md:py-3 rounded-full border transition-all duration-500 ${
          scrolled
            ? 'bg-void/80 border-white/10 backdrop-blur-xl'
            : 'bg-void/40 border-white/[0.05] backdrop-blur-md'
        }`}
      >
        <Link to="/" className="flex items-center gap-2 group">
          <Hexagon className="w-4 h-4 text-gold transition-transform duration-300 group-hover:rotate-90" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-starlight">
            Acuity
          </span>
        </Link>

        <div className="h-3 w-px bg-white/10" />

        <div className="flex items-center gap-3 md:gap-6 relative">
          <div className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.08em] md:tracking-[0.15em] text-starlight/60 gold-underline pb-0.5 transition-colors duration-300 hover:text-starlight flex items-center gap-1"
            >
              The Tools
              <ChevronDown className={`w-3 h-3 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
            </button>
            {toolsOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-void/95 border border-white/10 rounded-xl py-2 shadow-xl backdrop-blur-xl z-50">
                {TOOLS.map((tool) => (
                  tool.disabled ? (
                    <div
                      key={tool.label}
                      className="px-4 py-2 text-[11px] uppercase tracking-wider text-starlight/30 cursor-not-allowed"
                    >
                      {tool.label}
                    </div>
                  ) : (
                    <Link
                      key={tool.label}
                      to={tool.to}
                      onClick={() => setToolsOpen(false)}
                      className="block px-4 py-2 text-[11px] uppercase tracking-wider text-starlight/70 hover:text-gold hover:bg-white/5 transition-colors"
                    >
                      {tool.label}
                    </Link>
                  )
                ))}
              </div>
            )}
          </div>

          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={
                'action' in link && link.action === 'webinars'
                  ? (e: React.MouseEvent) => {
                      e.preventDefault();
                      onWebinarsClick();
                    }
                  : 'action' in link && link.action === 'shorts'
                    ? (e: React.MouseEvent) => {
                        e.preventDefault();
                        onShortsClick();
                      }
                    : undefined
              }
              className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.08em] md:tracking-[0.15em] text-starlight/60 gold-underline pb-0.5 transition-colors duration-300 hover:text-starlight"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
