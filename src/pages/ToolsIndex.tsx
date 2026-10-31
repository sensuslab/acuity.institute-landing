import { ArrowDown, ArrowUpRight, BookOpen, Compass, Layers, Sparkles, Vault } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tools } from '../components/tools/toolDirectory';
import { FeatureGrid, SourcePrinciple, Status, ToolClosing, ToolPage } from '../components/tools/ToolPrimitives';
import EcosystemMap from '../components/tools/EcosystemMap';
import ToolBrandMark from '../components/tools/ToolBrandMark';

export default function ToolsIndex() {
  return <ToolPage>
    <header className="tools-index-hero tools-index-intro tool-wrap"><p className="tool-eyebrow">Acuity.Institute / The Tools</p><Status /><h1>Many ways in.<br /><em>One deeper understanding.</em></h1><p className="tool-lead">Instruments for the enquiring mind. Explore uncensored knowledge and esoteric wisdom, return to the sources, and develop a perspective and practice of your own.</p><a className="tool-button" href="#ecosystem">Explore the constellation <ArrowDown size={16} /></a><p className="tool-small">The Library is open now. The connected services are coming soon.</p></header>
    <EcosystemMap />
    <section id="instruments" className="tool-wrap tool-section"><div className="tools-directory">{tools.filter(tool => tool.id !== 'wisdomvault').map((tool,i) => <Link className="tools-directory-item" key={tool.id} to={'/tools/' + tool.id}><div className="directory-card-top"><span className="tool-number">0{i + 1} / {tool.role}</span><span className={tool.live ? 'directory-live' : ''}>{tool.live ? 'Live now' : 'Coming soon'}</span></div><div className={'directory-emblem emblem-' + tool.id}><ToolBrandMark kind={tool.id} large /><i /><i /></div><h2>{tool.name}</h2><p>{tool.description}</p><span className="tool-text-link">Explore {tool.id === 'library' ? 'the Library' : tool.name}<ArrowUpRight size={16} /></span></Link>)}</div>
      <aside className="wisdom-placeholder"><Vault size={28} strokeWidth={1} aria-hidden="true" /><div><h2>WisdomVault <span>Under development</span></h2><p>The Acuity knowledge library, connected to your own services and applications through MCP. Discover passages, compare traditions and bring cited knowledge into the places you work.</p></div><span className="tool-number">On the horizon</span></aside>
    </section>
    <section className="tool-band"><div className="tool-wrap tool-section"><p className="tool-eyebrow">A pursuit, with many forms</p><h2 className="tools-index-statement">Explore. Consume. Synthesise.<br /><em>Personalise. Interpret.</em></h2><FeatureGrid items={[
      { icon: Compass, title: 'Broaden your perspective', text: 'Explore sacred, mystical and esoteric knowledge across traditions. Follow neglected voices and unfamiliar ideas, with room to form your own view.' },
      { icon: BookOpen, title: 'Stay connected to the text', text: 'Return to an edition, inspect a passage and distinguish the source from the explanation. Understanding grows through reading as well as conversation.' },
      { icon: Layers, title: 'Bring understanding into life', text: 'Make study material, develop a personal inquiry and build a reflective practice. The purpose is knowledge that inspires, unites and harmonises.' },
    ]} /><SourcePrinciple /></div></section>
    <section className="tool-wrap tools-begin"><Sparkles size={30} strokeWidth={1} /><h2>Your next question<br /><em>can begin here.</em></h2><Link className="tool-button" to="/library">Enter the open Library <ArrowUpRight size={17} /></Link></section>
    <ToolClosing />
  </ToolPage>;
}
