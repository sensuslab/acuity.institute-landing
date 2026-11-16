import { Plus } from 'lucide-react';
import faq from '../data/faq.json';
import categories from '../data/libraryCategories.json';
import { SectionLabel } from './SectionChrome';

const total = categories.filter(category => category.depth === 0).reduce((sum, category) => sum + category.count, 0);
const presentations = categories.find(category => category.key === 'Presentations')?.count ?? 0;

export default function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative py-24 md:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionLabel index="05">Questions</SectionLabel>
        <h2 id="faq-title" className="mt-5 font-display italic font-light text-[40px] md:text-[52px] leading-[1.05] text-starlight">
          Frequently <span className="text-gradient-gold">asked.</span>
        </h2>
        <div className="mt-10 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {faq.map(({ q, a }) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] text-starlight [&::-webkit-details-marker]:hidden">
                <h3 className="font-normal">{q}</h3>
                <Plus className="w-4 h-4 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45" strokeWidth={1.5} />
              </summary>
              <p className="mt-3 max-w-[64ch] text-[15px] leading-[1.75] text-starlight/55 font-light">{a
                .replace('{{LIBRARY_RECORDS}}', String(total))
                .replace('{{LIBRARY_TEXTS}}', String(total - presentations))
                .replace('{{LIBRARY_PRESENTATIONS}}', String(presentations))}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
