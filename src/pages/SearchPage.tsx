import { BookOpen, Compass, Download, Globe2, ListFilter, Search, Share2, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EvidencePreview, InstrumentExplorer, type Instrument } from '../components/tools/ToolDemos';
import { FeatureGrid, Journey, OutcomeStrip, SectionHeading, SourcePrinciple, ToolClosing, ToolFaq, ToolHero, ToolPage } from '../components/tools/ToolPrimitives';

const modes: Instrument[] = [
  { id: 'general', label: 'General', icon: Globe2, title: 'Look beyond the familiar results.', text: 'Research across the wider web and archival sources. Ask a broad question or follow a precise lead, bringing less visible material into an inquiry you can inspect.', points: ['Explore a theme across multiple discovery sources.', 'Choose a Quick pass or a more extensive Deep investigation.', 'Open the source links and evidence behind results.'] },
  { id: 'literature', label: 'Literature', icon: BookOpen, title: 'Find the work behind the idea.', text: 'Look for books, scripture, historical works and relevant editions. A named translation or catalogue entry can be the beginning of a more careful reading.', points: ['Keep author, translator and edition information where available.', 'Distinguish full-text excerpts from snippets and catalogue records.', 'See when a scan lacks readable text or a work is unavailable.'] },
  { id: 'collections', label: 'Collections', icon: Compass, title: 'Choose where the inquiry looks.', text: 'Focus a search on curated groups of sources relevant to a topic or tradition. Refine the field with included and excluded domains, so the scope reflects your study.', points: ['Explore topic-specific collections and their source lists.', 'Include relevant domains or exclude unwanted ones.', 'Keep your search scope visible as the research develops.'] },
];

export default function SearchPage() {
  return <ToolPage id="search" description="Acuity.Search — uncensored discovery across the web, literature and curated collections. Inspect evidence, synthesise findings and continue in Codex. Coming soon in Acuity.One.">
    <ToolHero kind="search" index="04" title={<>Look further.<br /><em>Discover more.</em></>} description="An uncensored field of inquiry for ideas beyond the usual view. Search the web, literature and chosen collections, examine the evidence, and follow what calls for closer understanding." />
    <OutcomeStrip items={['Three ways to discover', 'Evidence you can inspect', 'A path into deeper study']} />
    <section id="capabilities" className="tool-section tool-wrap">
      <SectionHeading number="01" eyebrow="Discovery with direction" title={<>A broader search.<br /><em>A deliberate scope.</em></>}><p>Esoteric knowledge is scattered across archives, translations, specialist collections and the wider web. Acuity.Search brings multiple routes of discovery into one place, with a scope you can shape.</p><p>Start broadly, look for a particular work, or focus on a group of domains. Choose the approach that suits the question rather than treating every inquiry the same way.</p></SectionHeading>
      <InstrumentExplorer label="Explore search modes" items={modes} />
      <FeatureGrid items={[
        { icon: Search, title: 'Quick or Deep', text: 'Take a focused first pass for an immediate lead, or give a complex question a broader investigation. Watch the research progress and inspect the results as they arrive.' },
        { icon: ListFilter, title: 'Shape the field', text: 'Use literature and collection modes to narrow your inquiry. Follow a tradition, investigate a topic or direct attention towards a chosen set of sources.' },
        { icon: Sparkles, title: 'Synthesise when it helps', text: 'Read the evidence directly or request a synthesis of the findings. Follow references back to their sources as you consider the explanation.' },
      ]} />
    </section>
    <section className="tool-band"><div className="tool-section tool-wrap">
      <SectionHeading number="02" eyebrow="From a lead to understanding" title={<>Discover freely.<br /><em>Read discerningly.</em></>}><p>Uncensored exploration leaves room for unfamiliar perspectives and neglected material. Visible evidence helps you decide what deserves attention, how much is accessible and what needs further reading.</p></SectionHeading>
      <EvidencePreview /><SourcePrinciple />
    </div></section>
    <section className="tool-section tool-wrap">
      <SectionHeading number="03" eyebrow="Keep the trail" title={<>A discovery should<br /><em>have somewhere to go.</em></>}><p>A useful result can become the beginning of a personal study. Keep the sources together, share a research trail or bring the findings into a Codex Context Sphere.</p></SectionHeading>
      <FeatureGrid items={[
        { icon: Share2, title: 'Share the research', text: 'Create a read-only research link so another person can follow the findings and inspect the supporting sources.' },
        { icon: Download, title: 'Keep a portable record', text: 'Export a readable Markdown research record, or keep a structured research bundle for continuing the work elsewhere.' },
        { icon: ShieldCheck, title: 'Preserve the evidence trail', text: 'Keep available passages, source references and synthesis together. A later interpretation can still be traced back to the material it used.' },
      ]} />
      <div className="search-handoff"><div className="handoff-labels" aria-hidden="true"><span><Search size={22} strokeWidth={1.2} /> Search</span><span className="handoff-thread"><i /><i /><i /></span><span><Compass size={22} strokeWidth={1.2} /> Codex</span></div><div><p className="tool-eyebrow">Discovery → Personal context</p><h3>Add to <em>Codex.</em></h3><p>Research from inside a sphere can return to that sphere. Research begun from Codex Home can open a new one. The selected sources and saved synthesis become material for further questions, notes and Studio creations.</p><Link className="tool-text-link" to="/tools/codex">Explore the Codex research journey <span aria-hidden="true">↗</span></Link></div></div>
    </section>
    <section id="journey" className="tool-section tool-wrap">
      <SectionHeading number="04" eyebrow="A research journey" title={<>Follow the lead.<br /><em>Keep the thread.</em></>}><p>Discovery, close reading and personal interpretation belong to the same ongoing practice. Move between the tools as your question develops.</p></SectionHeading>
      <Journey steps={[
        { title: 'Discover a direction', text: 'Choose General, Literature or Collections. Set the scope, investigate the results and open the available evidence.', to: '/tools', link: 'See the connected tools' },
        { title: 'Read more deeply', text: 'Return to the work itself. Find related editions in the Library and give the passage its original setting.', to: '/tools/library', link: 'Explore the Library' },
        { title: 'Make it your study', text: 'Bring selected research into Codex. Compare sources, connect notes and develop a synthesis or listening companion.', to: '/tools/codex', link: 'Explore Acuity.Codex' },
      ]} />
    </section>
    <ToolFaq items={[
      { question: 'What does uncensored discovery mean here?', answer: 'Acuity.Search is designed for broad inquiry across the web, archives and specialist collections, including esoteric and less visible material. You can shape the source scope and inspect what was actually found. Source availability and the amount of accessible text remain visible.' },
      { question: 'Does every result include a full text?', answer: 'No. A result may offer a full-text excerpt, a shorter snippet, a catalogue record or a scan without readable text. The evidence view distinguishes those states so you can assess the result on its actual coverage.' },
      { question: 'How does this differ from Acuity.Agent?', answer: 'Search discovers material across a wider field of online sources. Agent begins with the knowledge available in its curated archive and explores it conversationally. Codex is the personal workspace in which selected research can develop.' },
      { question: 'When can I begin?', answer: 'Acuity.Search is coming soon as part of Acuity.One. The open Library is live now, with source editions and study material available to browse and read.' },
    ]} /><ToolClosing current="search" />
  </ToolPage>;
}
