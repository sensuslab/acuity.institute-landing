import { renderToString } from 'react-dom/server';
import metadata from '../src/data/pageMetadata.json';
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
  { ...metadata['/tools/'], component: ToolsIndex },
  { ...metadata['/tools/agent/'], component: AgentPage },
  { ...metadata['/tools/codex/'], component: CodexPage },
  { ...metadata['/tools/library/'], component: LibraryPage },
  { ...metadata['/tools/search/'], component: SearchPage },
  { ...metadata['/tools/wisdomvault/'], component: WisdomVaultPage },
];

export function renderPage(page: typeof pages[number]) {
  const Page = page.component;
  return renderToString(<StaticRouter location={page.path}><div className="min-h-screen bg-void text-starlight"><Navigation onWebinarsClick={() => {}} onShortsClick={() => {}} /><Page /><Footer /></div></StaticRouter>);
}
