import { BookOpen, Compass, FileSearch, GitCompare, Library, MessageCircle, Quote, Route, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollFilm from '../components/ScrollFilm';
import { InquiryPreview } from '../components/tools/ToolDemos';
import { FeatureGrid, Journey, OutcomeStrip, SectionHeading, SourcePrinciple, ToolClosing, ToolFaq, ToolHero, ToolPage } from '../components/tools/ToolPrimitives';

export default function AgentPage() {
  return <ToolPage>
    <ToolHero kind="agent" index="01" title={<>Let curiosity<br />become <em>clarity.</em></>} description="A question is a doorway. Acuity.Agent follows it through the Library: finding passages, illuminating context and bringing different voices into a conversation you can make your own." />
    <OutcomeStrip items={['Ask in your own words', 'Follow the source', 'Deepen your understanding']} />
    <ScrollFilm film="agent" />
    <section id="capabilities" className="tool-section tool-wrap">
      <SectionHeading number="01" eyebrow="Creating pathways to wisdom" title={<>A conversation.<br /><em>A library in the room.</em></>}><p>Ask about a teaching, a difficult passage or an idea that keeps returning. The Agent searches the available texts and brings what it finds into a focused, readable response, with references you can follow.</p><p>Begin with a simple question. Ask for the context, compare another tradition, or return to the original wording. Each exchange can open a deeper line of study.</p></SectionHeading>
      <InquiryPreview />
      <FeatureGrid items={[
        { icon: MessageCircle, title: 'Inquire naturally', text: 'Use ordinary language to explore a concept, find a passage, unpack unfamiliar terminology or ask a more precise follow-up.' },
        { icon: Quote, title: 'Keep the evidence close', text: 'Follow citations back to the text. Original wording, the Agent’s explanation and your own interpretation remain distinguishable.' },
        { icon: GitCompare, title: 'Read across traditions', text: 'Compare themes across relevant collections. Notice shared concerns while keeping the history and distinctive voice of each tradition in view.' },
      ]} />
    </section>
    <section className="tool-band"><div className="tool-wrap tool-section">
      <SectionHeading number="02" eyebrow="The material behind the conversation" title={<>Many traditions.<br /><em>Specific sources.</em></>}><p>The Agent begins with Acuity’s available sacred-text archive. Its collection includes Internet Sacred Text Archive materials, named Bible editions and 281 public-domain source texts drawn from Ancient Wisdom Atlas.</p><p>These holdings support inquiry into scripture, world mythology, folklore and the inner life. The public Library has its own, wider catalogue: browse it directly to see which editions and reading formats are available.</p></SectionHeading>
      <div className="tool-source-columns">
        <article><Library size={24} strokeWidth={1.2} /><h3>Scripture &amp; sacred literature</h3><p>Explore the available sacred-text collections, including the American Standard Version (1901) and Berean Standard Bible. Follow the edition cited in an answer.</p></article>
        <article><Compass size={24} strokeWidth={1.2} /><h3>Myth, folklore &amp; wisdom</h3><p>The Ancient Wisdom Atlas selection extends the field of inquiry across world traditions, with the original source, translator, edition and rights information retained.</p></article>
        <article><FileSearch size={24} strokeWidth={1.2} /><h3>Passages in their setting</h3><p>Find a phrase or retrieve a passage with neighbouring text. Investigate the section around an idea before deciding what it means to you.</p></article>
      </div>
      <SourcePrinciple /><Link className="tool-text-link" to="/tools/library">Meet the Library <span aria-hidden="true">↗</span></Link>
    </div></section>
    <section className="tool-section tool-wrap">
      <div className="agent-art-panel"><picture><source media="(max-width: 700px)" srcSet="/agent/agent-hero-960.webp" /><img src="/agent/agent-hero-1600.webp" alt="Conceptual Acuity.Agent artwork showing a golden portal on a desktop and phone in a star-filled setting" loading="lazy" width="1600" height="893" /></picture><span>Conceptual product artwork / The inquiry, within reach</span></div>
      <FeatureGrid items={[
        { icon: Route, title: 'Follow a thread', text: 'Stay with a question across a conversation. Explore a related teaching or ask for a clearer explanation without losing the direction of your inquiry.' },
        { icon: BookOpen, title: 'Bring material into the conversation', text: 'Attach relevant files to a chat and ask questions about them. Your conversation can bring personal study material alongside the available knowledge sources.' },
        { icon: Sparkles, title: 'Keep the insight', text: 'Return to saved conversations or share a read-only conversation. Revisit the question, the explanation and the references as your understanding develops.' },
      ]} />
    </section>
    <section id="journey" className="tool-section tool-wrap">
      <SectionHeading number="03" eyebrow="From inquiry to integration" title={<>Understanding is<br /><em>something you practise.</em></>}><p>Use the Agent to open a line of inquiry. Read for yourself, develop your own response, and choose how an insight might become part of your life.</p></SectionHeading>
      <Journey steps={[
        { title: 'Begin with the text', text: 'Find an edition in the open Library. Read the passage in its own context and make room for the questions it raises.', to: '/tools/library', link: 'Explore the Library' },
        { title: 'Give the question a home', text: 'For a longer study, use a Codex Context Sphere to gather selected sources, personal notes and your developing interpretations.', to: '/tools/codex', link: 'Discover Acuity.Codex' },
        { title: 'Develop your practice', text: 'Carry what you learn into reflection, prayer or contemplation. Discover LumenNous among the Institute’s companion applications.', to: '/#apps', link: 'Explore companion applications' },
      ]} />
    </section>
    <ToolFaq items={[
      { question: 'What happens when the answer is not in the sources?', answer: 'The Agent is instructed to say when it cannot find support in the available material. It should identify gaps rather than invent a passage, quotation or reference.' },
      { question: 'Does a comparison mean the traditions say the same thing?', answer: 'No. A comparison can illuminate related themes while preserving different meanings, historical settings and interpretations. You can ask the Agent to examine those differences explicitly.' },
      { question: 'How does Agent differ from Codex?', answer: 'Agent is a conversational way into the available knowledge. Codex is a personal research environment for selecting and organising sources, developing notes, asking questions within a chosen scope and producing study material.' },
      { question: 'When can I use it?', answer: 'Acuity.Agent is coming soon as part of Acuity.One. The Library is live now, so you can begin exploring and reading the source material today.' },
    ]} /><ToolClosing current="agent" />
  </ToolPage>;
}
