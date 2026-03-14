import { Hexagon } from 'lucide-react';

const FOOTER_LINKS = ['Privacy', 'Terms', 'Contact'];

export default function Footer() {
  return (
    <footer className="relative pt-32 pb-12 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, #14111f 60%, rgba(212,168,67,0.06) 100%)',
        }}
      />

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[45%] select-none pointer-events-none">
        <span className="text-[8rem] md:text-[14rem] lg:text-[20rem] font-light tracking-tighter text-white/[0.03] whitespace-nowrap leading-none">
          ACUITY
        </span>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-center gap-2 mb-10">
          <Hexagon className="w-5 h-5 text-gold/60" strokeWidth={1.5} />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-starlight/60">
            Acuity Institute
          </span>
        </div>

        <p className="text-center text-sm font-light text-starlight/30 mb-12 max-w-sm mx-auto">
          Beyond the Horizon of Knowledge.
        </p>

        <div className="flex items-center justify-center gap-8 mb-10">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-starlight/30 gold-underline pb-0.5 transition-colors duration-300 hover:text-starlight/60"
            >
              {link}
            </a>
          ))}
        </div>

        <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-starlight/15">
          &copy; 2026 Acuity Institute
        </p>
      </div>
    </footer>
  );
}
