import { useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronLeft, ChevronRight, FileText, Layers, Maximize2, Orbit, Search, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export type Instrument = { id: string; label: string; icon: LucideIcon; title: string; text: string; points: string[] };

export function InstrumentExplorer({ items, label }: { items: Instrument[]; label: string }) {
  const [active, setActive] = useState(0);
  const id = useId().replace(/:/g, '');
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return <div className="instrument-explorer">
    <div role="tablist" aria-label={label} aria-orientation="vertical" className="instrument-tabs" onKeyDown={event => {
      let next = active;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (active + 1) % items.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (active + items.length - 1) % items.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = items.length - 1;
      else return;
      event.preventDefault(); setActive(next); buttons.current[next]?.focus();
    }}>
      {items.map((item, index) => <button key={item.id} ref={node => { buttons.current[index] = node; }} role="tab" aria-selected={active === index} aria-controls={id + '-panel-' + item.id} id={id + '-tab-' + item.id} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)}><span className="tool-number">0{index + 1}</span><item.icon size={19} strokeWidth={1.4} aria-hidden="true" /><span>{item.label}</span><ArrowUpRight size={16} aria-hidden="true" /></button>)}
    </div>
    {items.map((item, index) => {
      const Icon = item.icon;
      return <div key={item.id} className="instrument-panel" role="tabpanel" hidden={index !== active} tabIndex={0} id={id + '-panel-' + item.id} aria-labelledby={id + '-tab-' + item.id}>
        <div className="instrument-panel-top"><span className="tool-eyebrow">Explore the capability</span><Icon size={44} strokeWidth={.8} aria-hidden="true" /></div><h3>{item.title}</h3><p>{item.text}</p><ul>{item.points.map(point => <li key={point}><Check size={15} aria-hidden="true" />{point}</li>)}</ul>
      </div>;
    })}
  </div>;
}

const questions = [
  { label: 'Inner stillness', question: 'How do different traditions approach inner stillness?', sources: [{ title: 'Tao Te Ching', context: 'Explore simplicity, receptivity and action in Taoist thought.' }, { title: 'Meditations', context: 'Read Stoic reflections on attention and the inner life.' }, { title: 'Dhammapada', context: 'Follow Buddhist teachings on the mind and attentive living.' }], reflection: 'What might a more attentive moment look like in your own day?' },
  { label: 'Personal transformation', question: 'What does transformation mean in the mystical traditions?', sources: [{ title: 'The Cloud of Unknowing', context: 'Begin with the language of contemplative Christian practice.' }, { title: 'The Alchemy of Happiness', context: 'Explore ethical and spiritual development in Sufi thought.' }, { title: 'The Enneads', context: 'Investigate the philosophical language of return and contemplation.' }], reflection: 'Which idea invites further reading, and which asks something of your practice?' },
  { label: 'Symbols & meaning', question: 'How do symbols carry wisdom across cultures?', sources: [{ title: 'Hermetica', context: 'Explore the symbolic world of the Hermetic writings.' }, { title: 'Sepher Yetzirah', context: 'Consider creation, language and symbolic correspondences.' }, { title: 'Sacred Texts', context: 'Follow myths and motifs through the wider collection.' }], reflection: 'Where do you see a shared motif, and where does each tradition give it a distinct meaning?' },
];

export function InquiryPreview() {
  const [active, setActive] = useState(0);
  const item = questions[active];
  return <div className="inquiry-preview">
    <div className="demo-caption"><span className="demo-dot" />Illustrative study route · choose a question</div>
    <div className="demo-options" role="group" aria-label="Example inquiry topics">{questions.map((question, i) => <button key={question.label} aria-pressed={active === i} onClick={() => setActive(i)}>{question.label}</button>)}</div>
    <div className="inquiry-question"><span className="tool-eyebrow">The question</span><h3>{item.question}</h3></div>
    <div className="inquiry-sources" aria-live="polite">{item.sources.map((source, i) => <Link key={source.title} to={'/library?q=' + encodeURIComponent(source.title)}><span className="tool-number">0{i + 1}</span><BookOpen size={20} strokeWidth={1.2} aria-hidden="true" /><h4>{source.title}</h4><p>{source.context}</p><span className="tool-text-link">Find in the Library <ArrowUpRight size={14} /></span></Link>)}</div>
    <div className="inquiry-reflection"><span className="tool-eyebrow">A question to carry with you</span><p>{item.reflection}</p></div>
    <p className="demo-note">These are suggested reading directions, not a generated answer. Acuity.Agent’s answers will draw on retrieved passages and identify the editions used.</p>
  </div>;
}

const spheres = [
  { title: 'Contemplation', sources: ['Tao Te Ching', 'Meditations', 'The Cloud of Unknowing'], question: 'What changes when I pay attention?', note: 'Place contemplative texts beside your own observations. Keep the scope focused on the question you are exploring.' },
  { title: 'Symbols & myth', sources: ['Hermetica', 'Sepher Yetzirah', 'World mythology'], question: 'How does a symbol change across traditions?', note: 'Follow a motif across different sources, connect your notes and preserve the differences between their contexts.' },
  { title: 'Personal practice', sources: ['Selected passages', 'Private reflections', 'Study notes'], question: 'How might understanding become practice?', note: 'Gather the ideas you want to revisit. Develop a study guide or narration from your selection and record your own interpretation.' },
];

export function SpherePreview() {
  const [active, setActive] = useState(0);
  const sphere = spheres[active];
  return <div className="sphere-preview">
    <div className="sphere-stage">
      <span className="demo-caption">Illustrative Context Spheres · select an orbit</span>
      <svg className="sphere-connections" viewBox="0 0 600 380" fill="none" aria-hidden="true"><ellipse cx="300" cy="200" rx="230" ry="115" stroke="#d4a94a" strokeOpacity=".18" /><ellipse cx="300" cy="200" rx="210" ry="150" stroke="#d4a94a" strokeOpacity=".1" transform="rotate(-22 300 200)" /><path d="M145 190L330 105L440 270Z" stroke="#d4a94a" strokeOpacity=".35" strokeDasharray="3 8" /></svg>
      <div className="sphere-orbits" role="group" aria-label="Example knowledge bases">{spheres.map((item, i) => <button key={item.title} className={'sphere-node sphere-node-' + i} aria-pressed={active === i} onClick={() => setActive(i)}><span className="sphere-orb" aria-hidden="true"><Orbit size={i === 0 ? 49 : 38} strokeWidth={.6} /></span><span>{item.title}</span></button>)}</div>
      <span className="sphere-stage-note">Separate sources. Your own connections.</span>
    </div>
    <div className="sphere-scope" aria-live="polite"><p className="tool-eyebrow">Inside this example sphere</p><h3>{sphere.title}</h3><p>{sphere.note}</p><div className="sphere-source-list">{sphere.sources.map(source => <span key={source}><FileText size={14} aria-hidden="true" />{source}</span>)}</div><div className="sphere-question"><span className="tool-eyebrow">Through The Lens</span><p>{sphere.question}</p></div></div>
  </div>;
}

const readerPages = [
  { title: 'A quiet space to read.', text: 'Begin with the original text. Give a passage the time it needs, and let unfamiliar words become questions rather than obstacles. Return to the contents, follow a reference, and read the lines around an idea.', second: 'Your understanding can develop at its own pace. Change the type size and the colour of the page to suit the way you read.' },
  { title: 'Follow the thread.', text: 'A single book can open onto a wider tradition. Notice the edition, the translator and the setting in which the work was written. Read another voice beside it.', second: 'Keep the original passage distinct from your response to it. A question in the margin may be the beginning of your next line of study.' },
  { title: 'Carry it into life.', text: 'Knowledge becomes personal when you decide what to do with it. Revisit a passage, consider a different interpretation, or set aside a moment for reflection.', second: 'The next step need not be large. Choose one idea to contemplate, then return to the source with the experience you have gained.' },
];
const slides = [{ title: 'A question opens the door.', label: 'Explore', icon: Search }, { title: 'Read. Reflect. Connect.', label: 'Understand', icon: BookOpen }, { title: 'Let understanding become practice.', label: 'Integrate', icon: Orbit }];

export function ReaderPreview() {
  const [mode, setMode] = useState('epub');
  const [tone, setTone] = useState('paper');
  const [size, setSize] = useState(19);
  const [page, setPage] = useState(0);
  const [slide, setSlide] = useState(0);
  const SlideIcon = slides[slide].icon;
  return <div className="reader-preview">
    <div className="reader-preview-heading"><span className="demo-caption">Interactive reader concept · illustrative content</span><div className="reader-mode-buttons" role="group" aria-label="Preview a reading mode">{[{id:'epub',label:'EPUB reader',icon:BookOpen},{id:'pdf',label:'PDF view',icon:FileText},{id:'present',label:'Presentation',icon:Layers}].map(({id,label,icon:Icon}) => <button key={id} aria-pressed={mode === id} onClick={() => setMode(id)}><Icon size={15} aria-hidden="true" />{label}</button>)}</div></div>
    {mode === 'epub' ? <>
      <div className="reader-preview-toolbar"><fieldset><legend>Page tone</legend>{['white','paper','warm'].map(value => <button key={value} className={'tone-swatch tone-' + value} aria-label={value + ' page tone'} aria-pressed={tone === value} onClick={() => setTone(value)} />)}</fieldset><label>Text size <span>Aa</span><input type="range" min="16" max="26" value={size} onChange={event => setSize(Number(event.target.value))} aria-label="Preview text size" /><span>{size}px</span></label></div>
      <div className={'reader-paper tone-' + tone}><span className="reader-paper-eyebrow">THE ACUITY READING ROOM / A STUDY COMPANION</span><div className="reader-paper-body" style={{ fontSize: size }}><h3>{readerPages[page].title}</h3><p>{readerPages[page].text}</p><p>{readerPages[page].second}</p></div><div className="reader-paper-footer"><button aria-label="Previous preview page" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={20} /></button><span aria-live="polite">{page + 1} / {readerPages.length}</span><button aria-label="Next preview page" disabled={page === readerPages.length - 1} onClick={() => setPage(page + 1)}><ChevronRight size={20} /></button></div></div>
    </> : mode === 'pdf' ? <div className="pdf-concept"><div className="pdf-concept-page"><span>THE ORIGINAL EDITION</span><h3>Read at<br /><em>the source.</em></h3><div className="pdf-lines" aria-hidden="true">{Array.from({length:9},(_,i) => <i key={i} />)}</div><p>Original layout · page-based reading</p><small>Illustrative page, not a source facsimile</small></div><div><FileText size={32} strokeWidth={1} /><h3>Keep the page intact.</h3><p>View the original PDF with page navigation and zoom. Preserve the typography, illustrations and page references of the supplied edition.</p><Link className="tool-text-link" to="/library?format=pdf">Explore PDF editions<ArrowUpRight size={15} /></Link></div></div> : <div className="presentation-concept"><div className="presentation-slide"><span className="tool-eyebrow">Acuity / {slides[slide].label}</span><SlideIcon size={66} strokeWidth={.7} aria-hidden="true" /><h3>{slides[slide].title}</h3><span className="presentation-slide-number">0{slide + 1}</span></div><div className="presentation-controls"><button aria-label="Previous preview slide" disabled={slide === 0} onClick={() => setSlide(slide - 1)}><ArrowLeft size={18} /></button><span aria-live="polite">Slide {slide + 1} of {slides.length}</span><button aria-label="Next preview slide" disabled={slide === slides.length - 1} onClick={() => setSlide(slide + 1)}><ArrowRight size={18} /></button><span><Maximize2 size={14} aria-hidden="true" />Full-screen presentation available in the Library</span></div></div>}
    <p className="demo-note">Try the preview controls above, then open an edition in the live Library. Available reading modes depend on the files supplied for that work.</p>
  </div>;
}

export function EvidencePreview() {
  const [active, setActive] = useState(0);
  const states = [
    { label: 'Full-text excerpt', title: 'Read what the source actually says.', text: 'A retrieved passage can be inspected alongside its source link. Open the evidence, follow the reference, and decide how it supports the interpretation.' },
    { label: 'Snippet only', title: 'See how much evidence is available.', text: 'A short search excerpt is labelled as a snippet. You can distinguish a useful lead from a passage whose full context has been retrieved.' },
    { label: 'Catalogue record', title: 'An edition is a starting point.', text: 'A title, author or catalogue entry can help locate a work. The result shows when full text is unavailable, rather than presenting a catalogue description as a source quotation.' },
  ];
  return <div className="evidence-preview"><div><p className="tool-eyebrow">Evidence, made visible</p><h3>A result is an<br /><em>invitation to inspect.</em></h3><p>Expand the evidence behind a result. Keep the title, edition and source within reach, and know whether you are looking at a passage, a snippet or a catalogue lead.</p></div><div className="evidence-card"><div className="demo-caption">Illustrative evidence states</div><div className="demo-options" role="group" aria-label="Explore evidence coverage">{states.map((state,i) => <button key={state.label} aria-pressed={active === i} onClick={() => setActive(i)}>{state.label}</button>)}</div><div className="evidence-record" aria-live="polite"><span className="evidence-badge"><span />{states[active].label}</span><h4>{states[active].title}</h4><p>{states[active].text}</p><div className="evidence-fields"><span>Source &amp; edition</span><span>Coverage</span><span>Reference</span></div></div></div></div>;
}
