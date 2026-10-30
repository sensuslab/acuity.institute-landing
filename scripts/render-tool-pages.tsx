import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import Navigation from '../src/components/Navigation';
import Footer from '../src/components/Footer';
import AgentPage from '../src/pages/AgentPage';
import CodexPage from '../src/pages/CodexPage';
import LibraryPage from '../src/pages/LibraryPage';
import SearchPage from '../src/pages/SearchPage';
import ToolsIndex from '../src/pages/ToolsIndex';
import WisdomVaultPage from '../src/pages/WisdomVaultPage';

export const pages = [
  { path: '/tools/', title: 'The Tools', description: 'Explore the Acuity tools for uncensored knowledge, esoteric wisdom and personal development. The Library is live; Acuity.One is coming soon.', component: ToolsIndex },
  { path: '/tools/agent/', title: 'Acuity.Agent', description: 'Source-led inquiry into sacred texts and esoteric wisdom. Find passages, compare traditions and follow the evidence. Coming soon in Acuity.One.', component: AgentPage },
  { path: '/tools/codex/', title: 'Acuity.Codex', description: 'Context Spheres, The Archive, The Lens, myVault and Studio: a personal space to explore, synthesise and create. Coming soon in Acuity.One.', component: CodexPage },
  { path: '/tools/library/', title: 'The Library', description: 'Open access to sacred texts, esoteric literature, philosophy and presentations. Read with the virtual EPUB reader, original PDFs and presentation mode. Live now.', component: LibraryPage },
  { path: '/tools/search/', title: 'Acuity.Search', description: 'Uncensored discovery across the web, literature and curated collections, with inspectable evidence and a path into Codex. Coming soon in Acuity.One.', component: SearchPage },
  { path: '/tools/wisdomvault/', title: 'WisdomVault', description: 'Under development: connect the Acuity knowledge library to your own services and applications through MCP. Part of the forthcoming Acuity.One.', component: WisdomVaultPage },
];

export function renderPage(page: typeof pages[number]) {
  const Page = page.component;
  return renderToString(<StaticRouter location={page.path}><div className="min-h-screen bg-void text-starlight"><Navigation onWebinarsClick={() => {}} onShortsClick={() => {}} /><Page /><Footer /></div></StaticRouter>);
}
