import ProductGallery from '../components/tools/ProductGallery';
import ScrollFilm from '../components/ScrollFilm';
import { codexScreens } from '../components/tools/productScreens';
import { Archive, AudioLines, BookOpen, Download, Eye, Layers, LockKeyhole, Network, Orbit, Search } from 'lucide-react';
import { InstrumentExplorer, SpherePreview, type Instrument } from '../components/tools/ToolDemos';
import { FeatureGrid, Journey, OutcomeStrip, SectionHeading, SourcePrinciple, ToolClosing, ToolFaq, ToolHero, ToolPage } from '../components/tools/ToolPrimitives';

const instruments: Instrument[] = [
  { id: 'archive', label: 'The Archive', icon: Archive, title: 'Choose what enters your field.', text: 'Discover the curated material, inspect its provenance and open an edition before bringing it into your study. The Archive connects the wider Library to a purposeful personal selection.', points: ['Browse and filter the curated catalogue.', 'Read the available edition and inspect its source information.', 'Choose specific material for a Context Sphere.'] },
  { id: 'spheres', label: 'Context Spheres', icon: Orbit, title: 'Give each inquiry its own world.', text: 'A sphere is a separate knowledge base with its own sources, notes and outputs. Explore it spatially, connect related ideas and return to a view that helps you think.', points: ['Keep distinct research projects and personal interests separate.', 'Orbit, zoom, save camera views or use the list view.', 'Connect sources, notes and outputs within the same sphere.'] },
  { id: 'lens', label: 'The Lens', icon: Eye, title: 'Ask through a deliberate lens.', text: 'Choose the sources for a question and make the scope of your inquiry explicit. Read an answer beside its cited evidence, compare viewpoints and investigate the passages behind an interpretation.', points: ['Ask within the material selected for this sphere.', 'Inspect citations and supporting source passages.', 'Distinguish agreement, disagreement and gaps in the selection.'] },
  { id: 'vault', label: 'myVault', icon: LockKeyhole, title: 'Keep your developing understanding.', text: 'A private home for your study: personal notes, saved conversations, generated material and the history of your work. Revisit an idea and see how your interpretation has developed.', points: ['Write and revise private notes.', 'Keep your conversations and Studio outputs together.', 'Export your study with its references and available audio.'] },
  { id: 'studio', label: 'Studio', icon: Layers, title: 'Make something you can return to.', text: 'Turn a chosen set of sources into material that supports the way you learn. Build a study guide, compare viewpoints, develop a glossary or prepare a spoken exploration.', points: ['Create summaries, comparisons, research briefs and study guides.', 'Prepare narration and podcast scripts for review.', 'Generate spoken audio, with conversations of up to four voices.'] },
];

export default function CodexPage() {
  return <ToolPage>
    <ToolHero kind="codex" index="02" title={<>Turn the key.<br /><em>Unlock wisdom.</em></>} description="Your sources. Your questions. Your developing understanding. Acuity.Codex turns a collection of knowledge into a personal space for exploration, interpretation and creation." />
    <OutcomeStrip items={['Build your Context Spheres', 'Ask through The Lens', 'Create in the Studio']} />
    <ScrollFilm film="codex" />
    <section id="product-views" className="tool-section tool-wrap product-views">
      <SectionHeading number="01 / A closer look" eyebrow="The instrument in use" title={<>Step inside<br /><em>your field of study.</em></>}><p>Explore the workspace: a sphere’s sources, a question through The Lens, private notes and material created in Studio. Open a view to see the details.</p></SectionHeading>
      <ProductGallery product="codex" screens={codexScreens} />
    </section>
    <section id="capabilities" className="tool-section tool-wrap">
      <SectionHeading number="01" eyebrow="Instruments of Clarity" title={<>Knowledge becomes<br /><em>your field of discovery.</em></>}><p>Think of Codex as a cryptex: the knowledge is there, and a considered question begins to unlock it. Select what matters to you, bring sources into relation and follow the threads that emerge.</p><p>Scripture, mystical literature, philosophy and your own study material can become distinct knowledge bases. Each has a purpose and a boundary, so personal interpretation remains connected to the material that informed it.</p></SectionHeading>
      <div className="codex-film-story">{[
        {image:'discover',title:'Discover',text:'Gather the scattered pages.',alt:'Books floating in a cosmic field'},
        {image:'synthesise',title:'Synthesise',text:'Bring the threads together.',alt:'Golden threads of light weaving into a shared stream'},
        {image:'connect',title:'Interpret',text:'See a little more of the whole.',alt:'An interconnected constellation of luminous golden nodes'},
      ].map((scene,i) => <figure key={scene.image}><img src={'/tools/codex-' + scene.image + '.webp'} alt={scene.alt} width="1200" height="675" loading="lazy" /><figcaption><span className="tool-number">0{i + 1} / {scene.title}</span><p>{scene.text}</p></figcaption></figure>)}</div>
      <p className="demo-note film-credit">Conceptual artwork from the Acuity.Codex film. The interactive example below illustrates how a personal study can take shape.</p>
      <SpherePreview />
      <FeatureGrid items={[
        { icon: BookOpen, title: 'Begin with a source', text: 'Select curated Archive editions, add private study material or bring new discoveries in from Acuity.Search. Inspect the material before making it part of your context.' },
        { icon: Network, title: 'Make relationships visible', text: 'Connect sources, notes and outputs in a spatial view. Use these connections to organise your thinking and explore a question from another angle.' },
        { icon: Eye, title: 'Choose your perspective', text: 'Decide which sources The Lens considers. A focused selection can support a close reading; a broader one can open a comparative study.' },
      ]} />
    </section>
    <section className="tool-band"><div className="tool-section tool-wrap">
      <SectionHeading number="02" eyebrow="Five instruments, one study" title={<>From the first page<br /><em>to your own perspective.</em></>}><p>Move between discovery, organisation, conversation and creation. Each instrument plays a different part in the same personal research journey.</p></SectionHeading>
      <InstrumentExplorer label="Explore the five Codex instruments" items={instruments} />
    </div></section>
    <section className="tool-section tool-wrap">
      <SectionHeading number="03" eyebrow="Make knowledge usable" title={<>Learn in the form<br /><em>that speaks to you.</em></>}><p>Reading is one way in. The Studio makes room for synthesis, structured study and listening, using the sources you select and preserving references for review.</p></SectionHeading>
      <div className="studio-editorial"><div className="studio-sound" aria-hidden="true"><div className="studio-sound-orb"><AudioLines size={64} strokeWidth={.7} /></div><div className="studio-wave">{Array.from({length:43},(_,i) => <i key={i} style={{height: 10 + (i * 37 % 72) + '%', animationDelay: i * 45 + 'ms'}} />)}</div><span>Read / Reflect / Listen / Return</span></div><div><p className="tool-eyebrow">The Studio</p><h3>Let a study become<br /><em>a conversation.</em></h3><p>Prepare a narration or a discussion with multiple voices. Review the script, listen to the resulting audio and return to the original evidence when an idea deserves closer attention.</p><div className="tool-tags">{['Summaries','Comparisons','Study guides','Research briefs','Glossaries','Narration','Podcasts'].map(item => <span key={item}>{item}</span>)}</div><p className="tool-small">Generated material is a companion to your study. Source quotations and references stay distinct from the interpretation.</p></div></div>
      <FeatureGrid items={[
        { icon: LockKeyhole, title: 'Personal by design', text: 'Your spheres, private notes and uploaded study material belong to your own workspace. Organise the knowledge around your questions and your practice.' },
        { icon: Search, title: 'Let discovery keep going', text: 'Open Acuity.Search from Codex, research beyond the Archive and add the selected research to a sphere, together with its sources and synthesis.' },
        { icon: Download, title: 'Take your work with you', text: 'Export notes, Lens conversations, Studio outputs, source provenance, your sphere’s connections and available audio. Original source files remain separate.' },
      ]} /><SourcePrinciple />
    </section>
    <section id="journey" className="tool-section tool-wrap">
      <SectionHeading number="04" eyebrow="A practice of understanding" title={<>Start with curiosity.<br /><em>Return with perspective.</em></>}><p>A sphere can hold a lifelong interest, a focused comparison or a question you are living with. Shape it around the way you want to develop.</p></SectionHeading>
      <Journey steps={[
        { title: 'Gather with intention', text: 'Begin in the Library or discover material with Search. Choose a manageable set of sources and give your sphere a clear purpose.', to: '/tools/search', link: 'Discover Acuity.Search' },
        { title: 'Study in context', text: 'Read, ask and compare. Trace the evidence, record your reflections and connect the ideas that matter to your inquiry.', to: '/tools/library', link: 'Meet the Library' },
        { title: 'Create & revisit', text: 'Develop a study guide, a synthesis or a spoken exploration. Bring what you learn back into your reading and personal practice.', to: '/tools/agent', link: 'Explore source-led inquiry' },
      ]} />
    </section>
    <ToolFaq items={[
      { question: 'What is a Context Sphere?', answer: 'A separate personal knowledge base with selected sources, notes and outputs. Its spatial view helps you organise relationships, while its source selection defines what The Lens uses for an inquiry.' },
      { question: 'Is myVault the same as WisdomVault?', answer: 'No. myVault is the private study space inside Acuity.Codex. WisdomVault is a separate service in development for connecting the Acuity knowledge library to your own applications.' },
      { question: 'Can I work with my own material?', answer: 'Codex supports private study material alongside selected Archive sources and research brought in from Search. Your notes, questions and outputs can stay within the sphere you create for that work.' },
      { question: 'When does Codex become available?', answer: 'Acuity.Codex is coming soon as part of Acuity.One. The public Library is already open for independent reading and study.' },
    ]} /><ToolClosing current="codex" />
  </ToolPage>;
}
