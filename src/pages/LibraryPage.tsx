import { ArrowUpRight, BookOpen, Download, FileText, Library, Monitor, Palette, ScrollText } from 'lucide-react';
import { Link } from 'react-router-dom';
import categories from '../data/libraryCategories.json';
import { ReaderPreview } from '../components/tools/ToolDemos';
import { FeatureGrid, Journey, OutcomeStrip, SectionHeading, SourcePrinciple, ToolClosing, ToolFaq, ToolHero, ToolPage } from '../components/tools/ToolPrimitives';

const topLevel = categories.filter(category => category.depth === 0);
const total = topLevel.reduce((sum, category) => sum + category.count, 0);
const collections = [
  { title: 'Sacred Texts', text: 'Complete source transcriptions from Ancient Wisdom Atlas: scripture, mythology, folklore and historical literature, organised by tradition.', tags: ['World traditions','Mythology','Folklore'], query: 'Sacred Texts', icon: ScrollText },
  { title: 'Scripture & apocrypha', text: 'Canonical texts, Gnostic writings, early Christian literature and works from Buddhist, Hindu, Taoist, Jewish, Islamic and other traditions.', tags: ['Sacred literature','Gnostic writings','Commentary'], query: 'Scripture', icon: BookOpen },
  { title: 'Mystical & esoteric literature', text: 'Hermetic thought, Kabbalah, Sufism, Christian mysticism, Theosophy, astrology and cosmology, with editions kept in their own settings.', tags: ['Hermeticism','Kabbalah','Mysticism'], query: 'Esoteric', icon: Library },
  { title: 'Philosophy & the inner life', text: 'Stoicism, Neoplatonism, Vedanta and Kashmir Shaivism. Explore the questions of self-knowledge, attention, consciousness and a considered life.', tags: ['Stoicism','Neoplatonism','Vedanta'], query: 'Philosophy', icon: FileText },
  { title: 'Original works & selected studies', text: 'Acuity’s original writing sits alongside selected articles and studies, including work on prayer, coherence, consciousness and comparative understanding.', tags: ['Original works','Essays','Personal development'], query: 'Original Works', icon: Palette },
  { title: 'Presentations & visual overviews', text: 'Widescreen decks and book-specific visual companions provide another route into complex ideas. Keep the overview beside the source edition as you study.', tags: ['Slide decks','Visual study','Book overviews'], query: 'Presentations', icon: Monitor },
];

export default function LibraryPage() {
  return <ToolPage>
    <ToolHero kind="library" index="03" title={<>Return to<br /><em>the source.</em></>} description="An open reading room for the enquiring mind. Explore sacred texts, esoteric literature and philosophy; read slowly, follow the lineage, and form your own understanding." />
    <OutcomeStrip items={['Open access · no account', 'Your way of reading', 'Sources & editions in view']} />
    <section id="capabilities" className="tool-section tool-wrap">
      <SectionHeading number="01" eyebrow="A place to stay with an idea" title={<>Read at your pace.<br /><em>In your own light.</em></>}><p>Move between a faithful page view and an adjustable reading edition where available. Change the type size, choose a warmer page, follow the contents and make the space comfortable for focused study.</p><p>The Library is live now. Read in the browser or download the available files, with no account required.</p></SectionHeading>
      <ReaderPreview />
      <FeatureGrid items={[
        { icon: BookOpen, title: 'Virtual e-reader', text: 'Read available EPUB editions with adjustable text, chapter navigation and internal links. Turn pages with touch or keyboard, and optionally remember your place on this device.' },
        { icon: FileText, title: 'Original page view', text: 'Open the supplied PDF, navigate pages and adjust the view. A scan or illustrated edition can retain its original composition and page references.' },
        { icon: Monitor, title: 'Presentation mode', text: 'Open a PDF page or deck as a screen-filling presentation. Advance through pages or slides with keyboard and touch controls, with browser fullscreen where supported.' },
      ]} />
    </section>
    <section className="tool-band"><div className="tool-section tool-wrap">
      <SectionHeading number="02" eyebrow="The collection" title={<>A wider inheritance.<br /><em>An open invitation.</em></>}><p>Read across traditions, return to a familiar teaching or venture into a less visible lineage. The catalogue brings primary works, later interpretation and contemporary study into a navigable reading room.</p><p>Search by title, author or theme; explore categories and subcategories, and choose the formats that suit your reading.</p></SectionHeading>
      <div className="library-stat-line"><div><strong>{total}</strong><span>catalogued texts &amp; presentations</span></div><div><strong>{topLevel.length}</strong><span>main collections</span></div><div><Download size={30} strokeWidth={1} /><span>Read online or download available files</span></div></div>
      <div className="library-collection-grid">{collections.map(({title,text,tags,query,icon:Icon}) => <Link key={title} to={'/library?q=' + encodeURIComponent(query)}><div><Icon size={24} strokeWidth={1.1} /><ArrowUpRight size={18} /></div><h3>{title}</h3><p>{text}</p><div className="tool-tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div></Link>)}</div><SourcePrinciple />
    </div></section>
    <section className="tool-section tool-wrap">
      <SectionHeading number="03" eyebrow="Know what you are reading" title={<>The original voice.<br /><em>The space around it.</em></>}><p>A source text and an explanation serve different purposes. The Library makes space for both, while preserving the distinction between them.</p></SectionHeading>
      <div className="library-edition-pair"><article><span className="tool-number">01 / THE EDITION</span><BookOpen size={30} strokeWidth={1} /><h3>The text itself.</h3><p>Inspect the named work, author, translator and edition information supplied with a record. Follow its source and rights notes, then open the available original or reading edition.</p><p>Different translations and editions can remain distinct. A generated EPUB is a reading companion to the preserved source transcription, with its attribution retained.</p></article><article><span className="tool-number">02 / THE COMPANION</span><Monitor size={30} strokeWidth={1} /><h3>Another way into it.</h3><p>Where a visual overview is supplied, use it to orient yourself: see the structure of a work, revisit a central theme or prepare for a closer reading.</p><p>Acuity overviews and standalone presentations are study companions. They remain separate from the original source text and its edition.</p></article></div>
    </section>
    <section id="journey" className="tool-section tool-wrap">
      <SectionHeading number="04" eyebrow="Where a reading can lead" title={<>A page can become<br /><em>a pathway.</em></>}><p>The Library is a place to read for its own sake, and the foundation for further inquiry. Acuity.One’s connected tools will extend what you can do with your study.</p></SectionHeading>
      <Journey steps={[
        { title: 'Ask a deeper question', text: 'Explore the available knowledge with Acuity.Agent, following cited passages and comparing ideas in conversation. Coming soon.', to: '/tools/agent', link: 'Meet Acuity.Agent' },
        { title: 'Build your own study', text: 'Create a Codex Context Sphere for a theme or personal question. Bring selected sources beside your notes and interpretations. Coming soon.', to: '/tools/codex', link: 'Meet Acuity.Codex' },
        { title: 'Widen the field', text: 'Use Acuity.Search to discover related works and voices beyond the curated collection, then examine the evidence for yourself. Coming soon.', to: '/tools/search', link: 'Meet Acuity.Search' },
      ]} />
    </section>
    <ToolFaq items={[
      { question: 'Is the Library open now?', answer: 'Yes. You can browse, read and download the available editions without creating an account. Each record shows the files and reading modes supplied for that work.' },
      { question: 'Why do some books have different reading options?', answer: 'An adjustable e-reader needs an EPUB reading edition. Works supplied as PDFs can be read in their original layout or presented page by page. A reading mode only appears when its required file is available.' },
      { question: 'Can I change the page warmth or text size?', answer: 'Yes, in the virtual EPUB reader. Choose the page colour and adjust the type size. You can also opt to remember your reading place on the device you are using.' },
      { question: 'How do source rights and attribution work?', answer: 'Read the rights, source and edition notes attached to the work. The catalogue includes public-domain source texts as well as other supplied material; access to an edition does not replace its individual rights notice.' },
    ]} /><ToolClosing current="library" />
  </ToolPage>;
}
