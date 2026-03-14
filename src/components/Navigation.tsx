import { useState, useEffect } from 'react';
import { Hexagon } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Library', href: '#' },
  { label: 'Philosophy', href: '#manifesto' },
  { label: 'Webinars', href: '#' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

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
        className={`flex items-center gap-4 md:gap-8 px-5 md:px-8 py-2.5 md:py-3 rounded-full border transition-all duration-500 ${
          scrolled
            ? 'bg-void/80 border-white/10 backdrop-blur-xl'
            : 'bg-void/40 border-white/[0.05] backdrop-blur-md'
        }`}
      >
        <a href="#hero" className="flex items-center gap-2 group">
          <Hexagon className="w-4 h-4 text-gold transition-transform duration-300 group-hover:rotate-90" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-starlight">
            Acuity
          </span>
        </a>

        <div className="h-3 w-px bg-white/10" />

        <div className="flex items-center gap-4 md:gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.15em] text-starlight/50 gold-underline pb-0.5 transition-colors duration-300 hover:text-starlight"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
