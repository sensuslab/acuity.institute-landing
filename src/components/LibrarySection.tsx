import { ArrowUpRight, BookOpen, Compass, Download, Library } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import categories from '../data/libraryCategories.json';

type Category = { key: string; label: string; depth: number; count: number };

const TOP_LEVEL = (categories as Category[]).filter((c) => c.depth === 0);
const TOTAL = TOP_LEVEL.reduce((sum, c) => sum + c.count, 0);

const PRINCIPLES = [
  {
    icon: BookOpen,
    title: 'Read at the source',
    text: 'Primary texts in faithful editions, from scripture and scholastic commentary to the mystics, alchemists and natural philosophers, read in the browser as PDF, EPUB or plain text.',
  },
  {
    icon: Compass,
    title: 'Curated, not collected',
    text: 'Each work is chosen, catalogued and placed within its tradition, so a single text opens onto the lineage around it rather than sitting alone in a list.',
  },
  {
    icon: Download,
    title: 'Open to every reader',
    text: 'Free to read and to download, with no account and nothing tracked. Acuity presentations sit beside the texts as companions to the study.',
  },
];

export default function LibrarySection() {
  const { ref, isVisible } = useScrollReveal(0.1);
  const reveal = (delay: number) => ({
    className: `transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`,
    style: { transitionDelay: `${delay}ms` },
  });

  return (
    <section id="library" className="relative py-32 md:py-40 px-6">
      <div ref={ref} className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-end mb-16 md:mb-20">
          <div className="md:col-span-7">
            <span style={reveal(0).style} className={`block font-mono text-[10px] uppercase tracking-[0.3em] text-gold/60 ${reveal(0).className}`}>
              The Acuity Library
            </span>
            <h2
              className={`mt-3 font-display italic font-light text-[44px] md:text-[64px] leading-[1.02] text-starlight ${reveal(150).className}`}
              style={reveal(150).style}
            >
              A library for
              <br />
              <span className="text-gradient-gold">the enquiring mind.</span>
            </h2>
          </div>
          <div className={`md:col-span-5 ${reveal(300).className}`} style={reveal(300).style}>
            <p className="text-[15px] leading-[1.75] text-starlight/55 font-light">
              The Library is the foundation of the Institute: an open reading room for the
              world's wisdom traditions. It exists so that anyone can return to the texts
              themselves, read them slowly, and form their own understanding before
              reaching for anyone else's interpretation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {PRINCIPLES.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className={`glass-card rounded-2xl p-8 ${reveal(400 + i * 120).className}`}
              style={reveal(400 + i * 120).style}
            >
              <div className="w-11 h-11 rounded-xl bg-gold/[0.08] flex items-center justify-center mb-6">
                <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-normal text-starlight tracking-tight mb-3">{title}</h3>
              <p className="text-sm text-starlight/55 font-light leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div
          className={`mt-10 rounded-2xl border border-white/[0.06] px-6 md:px-10 py-8 flex flex-col lg:flex-row lg:items-center gap-8 ${reveal(800).className}`}
          style={reveal(800).style}
        >
          <div className="flex items-center gap-4 shrink-0">
            <Library className="w-5 h-5 text-gold" strokeWidth={1.5} />
            <div>
              <div className="font-display text-4xl text-starlight leading-none">{TOTAL}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-starlight/40">
                texts &amp; presentations
              </div>
            </div>
          </div>
          <div className="hidden lg:block h-10 w-px bg-white/10" />
          <ul className="flex flex-wrap gap-2 flex-1" aria-label="Library collections">
            {TOP_LEVEL.map((c) => (
              <li
                key={c.key}
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-starlight/60 border border-white/10 rounded-full px-3 py-1.5"
              >
                {c.label} <span className="text-gold/70 ml-1">{c.count}</span>
              </li>
            ))}
          </ul>
          <a
            href="/library/"
            className="group inline-flex items-center justify-center gap-2 shrink-0 px-6 py-3 rounded-full border border-gold/50 text-gold font-mono text-[11px] uppercase tracking-[0.2em] transition-all duration-300 hover:bg-gold/10 hover:border-gold min-h-[44px]"
          >
            Enter the library
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
