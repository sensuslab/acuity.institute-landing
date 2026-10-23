import { ArrowUpRight } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { SectionLabel } from './SectionChrome';

const APPS = [
  {
    name: 'LumenNous',
    tagline: 'Personal Prayer & Cosmic Consciousness',
    description:
      'An open contemplative library of daily prayers, affirmations, guided practices and sacred listening, grounded in sources. No account, nothing to track, and it works offline.',
    href: 'https://lumennous.acuity.institute',
    domain: 'lumennous.acuity.institute',
    icon: '/apps/lumennous-icon.png',
    cta: 'Enter LumenNous',
    // Indigo night with a warm column of light, after the LumenNous palette.
    background:
      'radial-gradient(ellipse at 50% 0%, rgba(232,201,106,0.10) 0%, rgba(124,92,224,0.08) 40%, transparent 75%), linear-gradient(180deg, rgba(23,20,38,0.55) 0%, rgba(9,9,15,0.2) 100%)',
  },
  {
    name: 'myAeon',
    tagline: 'Your sky, read reflectively',
    description:
      'An interactive solar system and personal birth-chart workspace, with reflective astrological readings, narrated listening and a downloadable chart. Astrology as a practice of reflection, not prediction.',
    href: 'https://myaeon.acuity.institute',
    domain: 'myaeon.acuity.institute',
    icon: '/apps/myaeon-icon.png',
    cta: 'Open myAeon',
    // Deep celestial navy with a faint orbital glow, after the myAeon palette.
    background:
      'radial-gradient(circle at 80% 15%, rgba(96,140,220,0.10) 0%, transparent 45%), radial-gradient(circle at 15% 90%, rgba(212,168,67,0.06) 0%, transparent 50%), linear-gradient(180deg, rgba(5,6,22,0.6) 0%, rgba(9,9,15,0.2) 100%)',
  },
];

export default function AppsSection() {
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <section id="apps" className="relative py-28 md:py-36 px-6 overflow-hidden">
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, #09090f 0%, #0b0d18 55%, #09090f 100%)' }} />
      <div ref={ref} className="relative max-w-6xl mx-auto">
        <div className="mb-16 md:mb-20">
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}><SectionLabel index="04">Acuity Apps</SectionLabel></div>
          <h2
            className={`text-4xl md:text-5xl font-light tracking-tight text-starlight mt-3 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            Practices for daily life
          </h2>
          <p
            className={`mt-6 max-w-[58ch] text-[15px] leading-[1.75] text-starlight/50 font-light transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '250ms' }}
          >
            Companion applications from the Institute, each carrying what the Library
            preserves into a quiet, everyday practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {APPS.map((app, i) => (
            <article
              key={app.name}
              className={`relative overflow-hidden rounded-[28px] border border-gold/45 p-8 md:p-10 flex flex-col transition-all duration-700 hover:border-gold/80 hover:shadow-[0_0_40px_rgba(212,168,67,0.12)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ background: app.background, transitionDelay: `${300 + i * 150}ms` }}
            >
              <div className="flex items-center gap-5">
                <img
                  src={app.icon}
                  alt=""
                  width={64}
                  height={64}
                  loading="lazy"
                  className="w-16 h-16 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(212,168,67,0.15)]"
                />
                <div>
                  <h3 className="font-display text-[34px] leading-none text-starlight">{app.name}</h3>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70">
                    {app.tagline}
                  </p>
                </div>
              </div>
              <p className="mt-8 text-[15px] leading-[1.75] text-starlight/60 font-light flex-1">
                {app.description}
              </p>
              <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
                <a
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gold/50 text-gold font-mono text-[11px] uppercase tracking-[0.2em] transition-all duration-300 hover:bg-gold/10 hover:border-gold min-h-[44px]"
                >
                  {app.cta}
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <span className="font-mono text-[10px] text-starlight/25">{app.domain}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
