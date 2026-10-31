import { type ReactNode } from 'react';
import { ToolIllustration } from './ToolIllustration';
import ToolBrandMark from './ToolBrandMark';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Orbit, Sparkles, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import './tools.css';

import { tools, type ToolId } from './toolDirectory';

export function ToolPage({ children }: { children: ReactNode }) {
  return <main id="main" className="tool-page" tabIndex={-1}>{children}</main>;
}

export function Status({ live = false }: { live?: boolean }) {
  return <span className={'tool-status' + (live ? ' is-live' : '')}><span aria-hidden="true" />{live ? 'Live now · open access' : 'Acuity.One · coming soon'}</span>;
}

export function ToolHero({ kind, index, title, description }: { kind: ToolId; index: string; title: ReactNode; description: string }) {
  const tool = tools.find(item => item.id === kind)!;
  return <header className="tool-hero tool-wrap">
    <div className="tool-hero-copy">
      <Link to="/tools" className="tool-back"><span aria-hidden="true">←</span> The Tools <span className="tool-back-separator">/</span> {tool.role}</Link>
      <Status live={tool.live} />
      <h1><span className="tool-product"><ToolBrandMark kind={kind} />{tool.name}</span><span className="tool-headline">{title}</span></h1>
      <p className="tool-lead">{description}</p>
      <div className="tool-actions">
        {tool.live ? <Link className="tool-button" to="/library">Enter the Library <ArrowUpRight size={16} /></Link> : <a className="tool-button" href="#capabilities">Explore the capabilities <ArrowDown size={16} /></a>}
        <a href="#journey" className="tool-text-link">{tool.live ? 'Find your way in' : 'See how it connects'} <ArrowRight size={15} /></a>
      </div>
    </div>
    <ToolArtwork kind={kind} index={index} />
  </header>;
}

export function SectionHeading({ number, eyebrow, title, children }: { number: string; eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return <div className="tool-section-heading"><div><p className="tool-eyebrow"><span>{number}</span> {eyebrow}</p><h2>{title}</h2></div>{children ? <div className="tool-section-description">{children}</div> : null}</div>;
}

export function OutcomeStrip({ items }: { items: string[] }) {
  return <div className="tool-outcomes tool-wrap" aria-label="At a glance">{items.map((item, i) => <div key={item}><span className="tool-number">0{i + 1}</span><span>{item}</span><Sparkles aria-hidden="true" size={14} /></div>)}</div>;
}

export function FeatureGrid({ items }: { items: { icon: LucideIcon; title: string; text: string }[] }) {
  return <div className="tool-feature-grid">{items.map(({ icon: Icon, title, text }) => <article key={title}><Icon size={23} strokeWidth={1.3} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div>;
}

export function Journey({ steps }: { steps: { title: string; text: string; to: string; link: string }[] }) {
  return <ol className="tool-journey">{steps.map((step, i) => <li key={step.title}><span className="journey-number">0{i + 1}</span><h3>{step.title}</h3><p>{step.text}</p><Link className="tool-text-link" to={step.to}>{step.link}<ArrowUpRight size={15} /></Link></li>)}</ol>;
}

export function ToolFaq({ items }: { items: { question: string; answer: string }[] }) {
  return <section className="tool-section tool-wrap tool-faq"><div><p className="tool-eyebrow">A few useful distinctions</p><h2>Room for<br /><em>understanding.</em></h2></div><div>{items.map(item => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></section>;
}

export function ToolClosing({ current }: { current?: ToolId }) {
  const active = tools.find(tool => tool.id === current);
  return <>
    <section className="tool-one tool-wrap">
      <div className="tool-one-mark" aria-hidden="true"><Orbit size={42} strokeWidth={0.8} /></div>
      <div><p className="tool-eyebrow">One connected field of exploration</p><h2>Acuity.<em>One</em></h2><p>Explore, consume, synthesise, personalise and interpret. The Acuity tools bring different ways of knowing into a shared pursuit: personal development, considered practice, and understanding that inspires, unites and harmonises.</p></div>
      <div className="tool-one-status"><Status /><p>The Library is open now.<br />The connected services are coming soon.</p>{active?.domain ? <a href={'https://' + active.domain} target="_blank" rel="noopener noreferrer">{active.domain}<ArrowUpRight size={13} /><span className="sr-only"> — service address, coming soon; opens in a new tab</span></a> : <Link className="tool-text-link" to="/library">Begin in the Library <ArrowUpRight size={15} /></Link>}</div>
    </section>
    <nav className="tool-related tool-wrap" aria-label="Explore the other tools"><p className="tool-eyebrow">Continue exploring</p><div>{tools.filter(tool => tool.id !== current && tool.id !== 'wisdomvault').map(({ id, name, role }) => <Link key={id} to={'/tools/' + id}><ToolBrandMark kind={id} /><span><small>{role}</small>{name}</span><ArrowUpRight size={17} /></Link>)}</div></nav>
  </>;
}

/** Editorial brand artwork, including the supplied raster Codex figure. */
export function ToolArtwork({ kind, index = '00' }: { kind: ToolId; index?: string }) {
  return <figure className={'tool-artwork art-' + kind}>
    {kind !== 'codex' ? <><div className="art-aura" aria-hidden="true" /><div className="art-reticle" aria-hidden="true" /></> : null}
    <div className="art-float">
      {kind === 'codex' ? <img src="/tools/codex-instrument.webp" alt="An illuminated golden cryptex within hexagonal celestial geometry, encircled by orbital paths and three glowing stars" width="1254" height="1120" /> : <ToolIllustration kind={kind} />}
    </div>
    <figcaption><span>FIG. {index} / {tools.find(tool => tool.id === kind)?.role}</span><span>Knowledge, illuminated <span aria-hidden="true">✧</span></span></figcaption>
  </figure>;
}

export function SourcePrinciple() {
  return <div className="tool-source-principle"><BookOpen size={22} strokeWidth={1.2} aria-hidden="true" /><p><strong>Uncensored inquiry. Sources you can inspect.</strong> Explore unfamiliar ideas, read across traditions and form your own interpretation. Keep the original wording, its historical context and the evidence within reach.</p></div>;
}
