import { ArrowDownToLine, BookOpen, Presentation } from 'lucide-react';
import type { LibraryOverview } from '../data/library';

export default function LibraryOverviews({overviews, onOpen}: {
  overviews: LibraryOverview[];
  onOpen: (overview: LibraryOverview, present: boolean) => void;
}) {
  if (!overviews.length) return null;
  return <section className="library-overviews" aria-labelledby="overview-heading">
    <h3 id="overview-heading"><Presentation size={18}/> Visual overview</h3>
    <p>A brief slide companion to this text. Explore the overview, then return to the original for the full reading.</p>
    {overviews.map(overview => <article className="library-overview-card" key={overview.id}>
      <div className="overview-cover" aria-hidden="true"><Presentation size={28}/><span>{overview.pages} SLIDES</span></div>
      <div className="overview-content"><h4>{overview.title}</h4>
        <p>{overview.language} · {overview.pages} slides{overview.pdfBytes ? ` · ${(overview.pdfBytes / 1024 / 1024).toFixed(1)} MB PDF` : ''}</p>
        <div className="library-downloads">
          <button className="library-primary" onClick={() => onOpen(overview, false)}><BookOpen size={16}/> View overview</button>
          <button className="library-secondary" onClick={() => onOpen(overview, true)}><Presentation size={16}/> Present overview</button>
          <a className="library-secondary" href={overview.pdf} download><ArrowDownToLine size={16}/> Overview PDF</a>
          {overview.pptx && <a className="library-secondary" href={overview.pptx} download><ArrowDownToLine size={16}/> Overview PPTX</a>}
        </div>
        {overview.imageOnly && <p className="overview-text-note">Image-based slides. The source text is available through the reading options above.</p>}
      </div>
    </article>)}
  </section>;
}
