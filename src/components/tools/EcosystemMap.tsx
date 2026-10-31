import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, BookOpen, Compass, Network, Sparkles, Vault } from 'lucide-react';
import { Link } from 'react-router-dom';
import EcosystemGlyph from './EcosystemGlyph';
import { ecosystem, ecosystemConnections, type EcosystemId } from './ecosystemDirectory';
import './ecosystem.css';

export default function EcosystemMap() {
  const [active, setActive] = useState<EcosystemId>('codex');
  const [dismissed, setDismissed] = useState<EcosystemId | null>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const atlas = useRef<HTMLDivElement>(null);
  const nodes = useRef<Partial<Record<EcosystemId, HTMLElement>>>({});
  const prefix = 'atlas-' + useId().replace(/:/g, '');
  const selected = ecosystem[active];
  const related = ecosystemConnections.filter(edge => edge.from === active || edge.to === active);
  useEffect(() => {
    const element = atlas.current;
    if (!element) return;
    const measure = () => {
      const parent = element.getBoundingClientRect();
      setPaths(ecosystemConnections.map(edge => {
        const from = nodes.current[edge.from]?.getBoundingClientRect();
        const to = nodes.current[edge.to]?.getBoundingClientRect();
        if (!from || !to) return '';
        const a = { x: from.x + from.width / 2 - parent.x, y: from.y + from.height / 2 - parent.y };
        const b = { x: to.x + to.width / 2 - parent.x, y: to.y + to.height / 2 - parent.y };
        const middle = (a.y + b.y) / 2;
        return `M${a.x},${a.y} C${a.x},${middle} ${b.x},${middle} ${b.x},${b.y}`;
      }));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const node of Object.values(nodes.current)) if (node) observer.observe(node);
    measure();
    return () => observer.disconnect();
  }, []);

  function destination(href: string, label: string, className: string) {
    return href.startsWith('https://') ? <a className={className} href={href} target="_blank" rel="noopener noreferrer">{label}<ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a> : <Link className={className} to={href}>{label}<ArrowUpRight size={14} aria-hidden="true" /></Link>;
  }
  function node(id: EcosystemId) {
    const item = ecosystem[id];
    return <article key={id} ref={element => { if (element) nodes.current[id] = element; }} className={'eco-node eco-node-' + id + (active === id ? ' is-selected' : '') + (id === 'wisdomvault' ? ' is-future' : '')} data-tooltip-open={dismissed !== id} onKeyDown={event => { if (event.key === 'Escape') setDismissed(id); }} onPointerEnter={event => { if (event.pointerType !== 'touch' && window.matchMedia('(min-width: 761px) and (hover: hover)').matches) { setActive(id); setDismissed(null); } }} onFocusCapture={() => { setActive(id); setDismissed(null); }}>
      <button type="button" className="eco-node-select" onClick={() => {
        setActive(id);
        if (window.matchMedia('(max-width: 760px)').matches) {
          const details = document.getElementById(prefix + '-details');
          details?.focus({ preventScroll: true });
          details?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        }
      }} aria-pressed={active === id} aria-controls={prefix + '-details'} aria-describedby={prefix + '-tip-' + id} aria-label={'About ' + item.name}>
        <span className="eco-node-art" aria-hidden="true"><EcosystemGlyph kind={id} /></span><span className="eco-node-name">{item.name}</span><span className="eco-node-short">{item.short}</span>
      </button>
      <div className="eco-node-foot"><span className={id === 'library' ? 'eco-live' : ''}>{id === 'library' ? 'Live now' : id === 'media' ? 'Watch & learn' : id === 'wisdomvault' ? 'In development' : 'Coming soon'}</span>{item.href ? destination(item.href, 'Explore', 'eco-node-link') : <span className="eco-node-unavailable">On the horizon</span>}</div>
      <div className="eco-node-tip" id={prefix + '-tip-' + id} role="tooltip"><strong>{item.role}</strong><p>{item.description}</p></div>
    </article>;
  }

  return <section id="ecosystem" className="ecosystem-section" aria-labelledby={prefix + '-heading'}>
    <div className="tool-wrap ecosystem-heading"><div><p className="tool-eyebrow">01 / The ecosystem</p><h2 id={prefix + '-heading'}>Knowledge, <em>in constellation.</em></h2></div><p>Hover, focus or tap an instrument to see its place in the whole. Follow its link to explore further.</p></div>
    <div ref={atlas} className="eco-atlas tool-wrap">
      <div className="eco-night" aria-hidden="true"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMid slice"><g fill="#e8dfca">{Array.from({length:180},(_,n) => <circle key={n} cx={(n*317+51)%1400} cy={(n*179+27)%1000} r={n%19===0?1.8:n%5===0?1:.55} opacity={.15+(n%7)*.1} />)}</g><g fill="none" stroke="#d4b778" strokeWidth=".6" opacity=".13"><circle cx="95" cy="150" r="150" /><circle cx="95" cy="150" r="105" /><path d="M0 150H275M95 0V360" /><circle cx="1340" cy="290" r="220" /><circle cx="1340" cy="290" r="170" /><path d="M1090 290H1400M1340 10V555" /></g><g className="eco-twinkle" fill="#fff1c4">{[[170,135],[1090,105],[1240,630],[95,730],[735,290]].map(([x,y])=><path key={x} d={`M${x} ${y-8}L${x+1.4} ${y-1.4}L${x+8} ${y}L${x+1.4} ${y+1.4}L${x} ${y+8}L${x-1.4} ${y+1.4}L${x-8} ${y}L${x-1.4} ${y-1.4}Z`} />)}</g></svg></div>
      <svg className="eco-threads" aria-hidden="true"><defs><filter id={prefix + '-glow'} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" /></filter></defs>{ecosystemConnections.map((edge,i) => <g key={edge.from + edge.to} className={(edge.from === active || edge.to === active) ? 'is-lit' : ''}><path d={paths[i]} className="eco-thread-glow" filter={'url(#' + prefix + '-glow)'} /><path d={paths[i]} className="eco-thread" /><path d={paths[i]} className="eco-thread-flow" /></g>)}</svg>
      <div className="eco-crown"><svg viewBox="0 0 120 100" fill="none" aria-hidden="true"><path d="M26 88V44a34 34 0 0 1 68 0V88M34 88V44a26 26 0 0 1 52 0V88M17 89H103" stroke="currentColor" /><circle cx="60" cy="40" r="5" fill="currentColor" /><path d="M60 6V25M51 15H69" stroke="currentColor" /></svg><p>Acuity.Institute</p><span>Beyond the Horizon of Knowledge</span></div>
      <div className="eco-groups">
        <div className="eco-group eco-discover"><h3>Discover <span>&</span> Learn</h3>{node('library')}{node('media')}</div>
        <div className="eco-group eco-research"><h3>Research <span>&</span> Create</h3><div className="eco-research-nodes">{node('agent')}{node('search')}{node('codex')}</div></div>
        <div className="eco-group eco-practice"><h3>Reflect <span>&</span> Practise</h3>{node('lumennous')}{node('myaeon')}</div>
      </div>
      <div className="eco-foundations"><p>Connected knowledge & capabilities</p><div>{[{icon:BookOpen,title:'Knowledge resources',text:'The works, editions and source material'},{icon:Compass,title:'Research & discovery',text:'Questions, evidence and new connections'},{icon:Network,title:'Intelligence & media',text:'Interpretation, study and expression'}].map(({icon:Icon,title,text},i)=><div key={title} style={{'--foundation-delay':i*.4+'s'} as CSSProperties}><Icon size={26} strokeWidth={1} aria-hidden="true" /><span>{title}<small>{text}</small></span></div>)}</div></div>
      <div className="eco-vault-row"><div><Vault size={20} strokeWidth={1.1} aria-hidden="true" /><span>Beyond the constellation<small>The knowledge library in your own applications</small></span></div>{node('wisdomvault')}</div>
    </div>
    <div className="eco-detail tool-wrap" id={prefix + '-details'} role="region" tabIndex={-1} aria-label="Selected instrument details" aria-live="polite" aria-atomic="true">
      <div className="eco-detail-heading"><p className="tool-eyebrow">{selected.role}</p><h3>{selected.name}</h3><span className={'eco-detail-status' + (active === 'library' ? ' eco-live' : '')}>{selected.status}</span>{selected.href ? destination(selected.href, selected.cta, 'tool-text-link') : <span className="eco-detail-status">A future connection</span>}</div>
      <div><p className="eco-detail-description">{selected.description}</p><ul className="eco-detail-points">{selected.points.map(point=><li key={point}><Sparkles size={11} aria-hidden="true" />{point}</li>)}</ul><div className="eco-related-paths"><span>Connected pathways</span>{related.map(edge=><span key={edge.from+edge.to}>{ecosystem[edge.from === active ? edge.to : edge.from].name}<small>{edge.label}</small></span>)}</div></div>
    </div>
    <p className="eco-caption tool-wrap">A map of the Acuity vision. The Library is open now; connected services are coming soon. Luminous paths show ways to explore, study and practise.</p>
  </section>;
}
