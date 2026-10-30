import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Hexagon, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { tools } from './tools/toolDirectory';
import './navigation.css';

export default function Navigation({ onWebinarsClick, onShortsClick }: { onWebinarsClick: () => void; onShortsClick: () => void }) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  useEffect(() => { setToolsOpen(false); setMobileOpen(false); }, [location.pathname, location.hash]);
  useEffect(() => {
    if (!toolsOpen && !mobileOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (!nav.current?.contains(event.target as Node)) { setToolsOpen(false); setMobileOpen(false); }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (mobileOpen) { setMobileOpen(false); mobileTrigger.current?.focus(); }
      else { setToolsOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [toolsOpen, mobileOpen]);
  const close = () => { setMobileOpen(false); setToolsOpen(false); };
  const media = (action: () => void) => { close(); action(); };
  return <nav ref={nav} className="acuity-nav" aria-label="Main navigation">
    <a className="acuity-skip-link" href="#main">Skip to content</a>
    <div className="acuity-nav-bar">
      <Link to="/" className="acuity-nav-brand" onClick={close}><Hexagon size={19} strokeWidth={1.3} aria-hidden="true" /><span>ACUITY<span>.INSTITUTE</span></span></Link>
      <div className="acuity-nav-desktop">
        <div className="acuity-nav-tools">
          <button ref={trigger} className={location.pathname.startsWith('/tools') ? 'nav-current' : ''} aria-expanded={toolsOpen} aria-controls="tools-navigation" onClick={() => setToolsOpen(!toolsOpen)}>The Tools <ChevronDown size={12} className={toolsOpen ? 'is-open' : ''} aria-hidden="true" /></button>
          <div className="acuity-tools-dropdown" id="tools-navigation" hidden={!toolsOpen}><Link to="/tools" className="acuity-tools-overview" onClick={close}>The Tools <span>Explore the ecosystem ↗</span></Link>{tools.map(tool => tool.id === 'wisdomvault' ? <div key={tool.id} className="acuity-tool-disabled" aria-disabled="true"><tool.icon size={18} strokeWidth={1.2} aria-hidden="true" /><span>WisdomVault<small>Under development</small></span><span>SOON</span></div> : <NavLink key={tool.id} to={'/tools/' + tool.id} onClick={close}><tool.icon size={18} strokeWidth={1.2} aria-hidden="true" /><span>{tool.id === 'library' ? 'Library' : tool.id === 'agent' ? 'Agent' : tool.id === 'codex' ? 'Codex' : 'Search'}<small>{tool.role}</small></span><span className={tool.live ? 'nav-live' : ''}>{tool.live ? 'LIVE' : 'SOON'}</span></NavLink>)}</div>
        </div>
        <Link to="/library">Library</Link><Link to="/#manifesto">Philosophy</Link><button onClick={() => media(onWebinarsClick)}>Webinars</button><button onClick={() => media(onShortsClick)}>Shorts</button>
      </div>
      <button ref={mobileTrigger} className="acuity-mobile-trigger" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
    </div>
    <div className="acuity-mobile-panel" id="mobile-navigation" hidden={!mobileOpen}><Link to="/tools" className="acuity-mobile-heading" onClick={close}>The Tools <span>Explore all ↗</span></Link>{tools.map(tool => tool.id === 'wisdomvault' ? <div key={tool.id} aria-disabled="true" className="acuity-tool-disabled"><tool.icon size={18} strokeWidth={1.2} aria-hidden="true" /><span>WisdomVault<small>Under development</small></span></div> : <NavLink key={tool.id} to={'/tools/' + tool.id} onClick={close}><tool.icon size={18} strokeWidth={1.2} aria-hidden="true" /><span>{tool.name}</span><small className={tool.live ? 'nav-live' : ''}>{tool.live ? 'Live now' : 'Coming soon'}</small></NavLink>)}<div className="acuity-mobile-secondary"><Link to="/library" onClick={close}>Enter the Library</Link><Link to="/#manifesto" onClick={close}>Philosophy</Link><button onClick={() => media(onWebinarsClick)}>Webinars</button><button onClick={() => media(onShortsClick)}>Shorts</button></div></div>
  </nav>;
}
