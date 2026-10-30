import { useEffect, useId, type ReactNode } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Orbit, Sparkles, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import './tools.css';

import { tools, type ToolId } from './toolDirectory';

export function ToolPage({ id, description, children }: { id?: ToolId; description: string; children: ReactNode }) {
  const name = tools.find(tool => tool.id === id)?.name || 'The Tools';
  useEffect(() => {
    const oldTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const oldDescription = meta?.content;
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const oldCanonical = canonical?.href;
    const social = [
      ['meta[property="og:title"]', name + ' — Acuity.Institute'],
      ['meta[property="og:description"]', description],
      ['meta[property="og:url"]', 'https://acuity.institute/tools' + (id ? '/' + id : '') + '/'],
      ['meta[name="twitter:title"]', name + ' — Acuity.Institute'],
      ['meta[name="twitter:description"]', description],
    ].map(([selector, value]) => {
      const node = document.querySelector<HTMLMetaElement>(selector);
      const previous = node?.content;
      if (node) node.content = value;
      return { node, previous };
    });
    document.title = name + ' — Acuity.Institute';
    if (meta) meta.content = description;
    if (canonical) canonical.href = 'https://acuity.institute/tools' + (id ? '/' + id : '') + '/';
    return () => {
      document.title = oldTitle;
      if (meta && oldDescription !== undefined) meta.content = oldDescription;
      if (canonical && oldCanonical) canonical.href = oldCanonical;
      social.forEach(({ node, previous }) => { if (node && previous !== undefined) node.content = previous; });
    };
  }, [name, id, description]);
  return <main id="main" className="tool-page">{children}</main>;
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
      <h1><span className="tool-product">{tool.name}</span><span className="tool-headline">{title}</span></h1>
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
    <nav className="tool-related tool-wrap" aria-label="Explore the other tools"><p className="tool-eyebrow">Continue exploring</p><div>{tools.filter(tool => tool.id !== current && tool.id !== 'wisdomvault').map(({ id, name, role, icon: Icon }) => <Link key={id} to={'/tools/' + id}><Icon size={20} strokeWidth={1.2} aria-hidden="true" /><span><small>{role}</small>{name}</span><ArrowUpRight size={17} /></Link>)}</div></nav>
  </>;
}

/** Original, code-native brand artwork. Decorative marks never represent product data. */
export function ToolArtwork({ kind, index = '00' }: { kind: ToolId; index?: string }) {
  const rawId = useId();
  const id = rawId.replace(/:/g, '');
  const gold = 'url(#' + id + '-gold)';
  const glow = 'url(#' + id + '-glow)';
  const light = 'url(#' + id + '-light)';
  const isCodex = kind === 'codex' || kind === 'wisdomvault';
  const labels: Record<ToolId, string> = { agent: 'An illuminated eye within a triangle, connected to a constellation of sources', codex: 'A golden cryptex opening within a celestial arch, with luminous threads linking knowledge spheres', library: 'Three golden books beneath an illuminated arch in a field of stars', search: 'A golden globe and magnifying lens revealing points in a constellation', wisdomvault: 'A golden knowledge vault connected to an orbit of applications' };
  if (kind === 'codex') return <figure className="tool-artwork art-codex art-cinematic"><div className="art-aura" aria-hidden="true" /><div className="art-reticle" aria-hidden="true" /><div className="art-float"><img src="/tools/codex-cryptex.webp" alt="A crystalline cryptex carrying luminous golden threads through a cosmic field, from the Acuity.Codex concept film" width="1200" height="675" /></div><figcaption><span>FIG. {index} / THE INSTRUMENT</span><span>Conceptual artwork <span aria-hidden="true">✧</span></span></figcaption></figure>;
  return <figure className={'tool-artwork art-' + kind}>
    <div className="art-aura" aria-hidden="true" /><div className="art-reticle" aria-hidden="true" />
    <div className="art-float">
      <svg viewBox="0 0 640 580" role="img" aria-label={labels[kind]}>
        <defs>
          <linearGradient id={id + '-gold'} x1="0" y1="0" x2="0.8" y2="1"><stop stopColor="#fff4cb" /><stop offset=".45" stopColor="#d4a94a" /><stop offset="1" stopColor="#85632b" /></linearGradient>
          <radialGradient id={id + '-light'}><stop stopColor="#ffe8a4" stopOpacity=".35" /><stop offset="1" stopColor="#d4a94a" stopOpacity="0" /></radialGradient>
          <filter id={id + '-glow'} x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="3.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <g fill="#e8c96a">{Array.from({ length: 36 }, (_, n) => <circle key={n} cx={30 + (n * 173 % 580)} cy={40 + (n * 97 % 470)} r={n % 7 === 0 ? 2 : 0.9} opacity={.15 + n % 4 * .12} />)}</g>
        <g fill="none" stroke="#d4a94a" strokeWidth=".7" opacity=".22"><polygon points="320,55 520,170 520,400 320,515 120,400 120,170" /><polygon points="320,80 498,182 498,388 320,490 142,388 142,182" /><ellipse cx="320" cy="440" rx="230" ry="44" /><path d="M75 440H565M320 440L140 565M320 440L500 565M320 440V570" /><path d="M100 187L185 118L320 55L450 124L555 214M120 400L66 320M520 400L571 337" /></g>
        <ellipse cx="320" cy="302" rx="225" ry="220" fill={light} />
        {kind === 'agent' ? <g fill="none" stroke={gold}>
          <path d="M192 181H448L320 405Z" strokeWidth="2" /><path d="M210 193H430L320 382Z" opacity=".35" />
          <path d="M236 255Q320 173 404 255Q320 337 236 255Z" strokeWidth="2.3" filter={glow} /><circle cx="320" cy="255" r="31" strokeWidth="1.5" /><circle cx="320" cy="255" r="10" fill="#f4d78d" filter={glow} />
          <ellipse cx="320" cy="278" rx="220" ry="128" transform="rotate(-22 320 278)" opacity=".4" /><path d="M145 204L236 255M462 350L404 255M320 405V456" opacity=".45" />
          {[ [145,204], [462,350], [320,456] ].map(([x,y]) => <g key={x}><circle cx={x} cy={y} r="7" fill="#eed294" filter={glow} /><circle cx={x} cy={y} r="15" opacity=".4" /></g>)}
        </g> : null}
        {isCodex ? <g fill="none" stroke={gold}>
          <path d="M205 425V208a115 115 0 0 1 230 0V425" strokeWidth="1.8" opacity=".55" /><path d="M223 425V208a97 97 0 0 1 194 0V425" opacity=".25" />
          <path d="M105 210Q160 210 214 286M535 185Q460 194 409 283M105 408Q160 375 218 321M530 414Q470 367 407 321" opacity=".7" strokeWidth="1.2" />
          <g transform="rotate(-16 320 298)">
            <path d="M215 222H425V374H215Z" fill="#100f15" fillOpacity=".9" /><ellipse cx="215" cy="298" rx="21" ry="76" fill="#151219" /><ellipse cx="425" cy="298" rx="21" ry="76" fill="#151219" />
            {Array.from({ length: 7 }, (_, n) => <g key={n}><ellipse cx={223 + n * 31} cy="298" rx="16" ry="76" strokeWidth={n === 3 ? '2.5' : '1.1'} opacity={n === 3 ? '1' : '.65'} /><path d={'M' + (223 + n * 31) + ' 230v18m0 100v18'} opacity=".4" /><circle cx={223 + n * 31} cy="298" r="3" fill="#f5d68a" /></g>)}
            <path d="M207 298H441" stroke="#fff0bb" strokeWidth="2" filter={glow} />
          </g>
          <circle cx="320" cy="95" r="7" fill="#ffe8a4" filter={glow} />
          {[ [105,210], [535,185], [105,408], [530,414] ].map(([x,y]) => <g key={x + y}><circle cx={x} cy={y} r="15" fill={light} /><circle cx={x} cy={y} r="5" fill="#f5d68a" filter={glow} /><circle cx={x} cy={y} r="20" opacity=".45" /></g>)}
        </g> : null}
        {kind === 'library' ? <g fill="none" stroke={gold}>
          <path d="M195 423V216a125 125 0 0 1 250 0V423" strokeWidth="3" filter={glow} /><path d="M211 423V216a109 109 0 0 1 218 0V423" strokeWidth="1" opacity=".55" />
          <g transform="translate(245 247)"><rect width="40" height="167" rx="4" fill="#211b19" /><rect x="49" y="-14" width="44" height="181" rx="4" fill="#18171c" /><rect x="102" y="6" width="42" height="161" rx="4" fill="#211b19" /><path d="M10 22H30M10 137H30M59 11H83M59 137H83M112 32H134M112 137H134" opacity=".6" /><path d="M20 50v50m51-69v72m53-43v43" opacity=".3" /></g>
          <ellipse cx="320" cy="428" rx="140" ry="13" opacity=".7" /><circle cx="320" cy="91" r="7" fill="#fff0bb" filter={glow} /><path d="M320 118V168M295 143H345" opacity=".35" />
        </g> : null}
        {kind === 'search' ? <g fill="none" stroke={gold}>
          <circle cx="300" cy="266" r="132" strokeWidth="1" opacity=".3" /><circle cx="300" cy="266" r="119" strokeWidth="3" filter={glow} /><ellipse cx="300" cy="266" rx="53" ry="119" strokeWidth="1.2" /><ellipse cx="300" cy="266" rx="119" ry="43" strokeWidth="1.2" /><path d="M181 266H419M300 147V385" opacity=".45" />
          <path d="M383 352L465 435Q474 445 485 434L489 430Q497 421 488 412L403 330" strokeWidth="2.5" fill="#18151b" />
          <path d="M352 156V218M321 187H383M332 167L372 207M332 207L372 167" stroke="#ffe9a9" filter={glow} strokeWidth="1.7" />
          <circle cx="252" cy="294" r="5" fill="#efd18a" /><path d="M252 294L325 325L356 243" opacity=".55" /><circle cx="325" cy="325" r="4" fill="#efd18a" /><circle cx="356" cy="243" r="4" fill="#efd18a" />
        </g> : null}
        <ellipse cx="320" cy="447" rx="130" ry="20" fill={light} />
      </svg>
    </div>
    <figcaption><span>FIG. {index} / {tools.find(tool => tool.id === kind)?.role}</span><span>Knowledge, illuminated <span aria-hidden="true">✧</span></span></figcaption>
  </figure>;
}

export function SourcePrinciple() {
  return <div className="tool-source-principle"><BookOpen size={22} strokeWidth={1.2} aria-hidden="true" /><p><strong>Uncensored inquiry. Sources you can inspect.</strong> Explore unfamiliar ideas, read across traditions and form your own interpretation. Keep the original wording, its historical context and the evidence within reach.</p></div>;
}
