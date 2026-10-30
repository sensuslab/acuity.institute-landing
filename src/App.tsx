import { lazy, Suspense, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
const LibraryPage = lazy(() => import('./components/LibraryPage'));
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import ManifestoSection from './components/ManifestoSection';
import LibrarySection from './components/LibrarySection';
import PillarsGrid from './components/PillarsGrid';
import AgentSection from './components/AgentSection';
import AppsSection from './components/AppsSection';
import { GoldDivider } from './components/SectionChrome';
import TrustConstellation from './components/TrustConstellation';
import FaqSection from './components/FaqSection';
import Contact from './components/Contact';
import Footer from './components/Footer';
import GrainOverlay from './components/GrainOverlay';
import MediaModal from './components/MediaModal';
import ShortsModal from './components/ShortsModal';
import ToolsIndex from './pages/ToolsIndex';
import AgentPage from './pages/AgentPage';
import CodexPage from './pages/CodexPage';
import LibraryToolsPage from './pages/LibraryPage';
import SearchPage from './pages/SearchPage';
import WisdomVaultPage from './pages/WisdomVaultPage';

function HomePage() {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [shortsOpen, setShortsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-void text-starlight">
      <GrainOverlay />
      <Navigation
        onWebinarsClick={() => setMediaOpen(true)}
        onShortsClick={() => setShortsOpen(true)}
      />
      <main id="main">
        <HeroSection />
        <ManifestoSection />
        <GoldDivider />
        <LibrarySection />
        <GoldDivider />
        <AgentSection />
        <GoldDivider />
        <PillarsGrid />
        <GoldDivider />
        <AppsSection />
        <GoldDivider />
        <TrustConstellation />
        <FaqSection />
        <Contact />
      </main>
      <Footer />
      <MediaModal open={mediaOpen} onClose={() => setMediaOpen(false)} />
      <ShortsModal open={shortsOpen} onClose={() => setShortsOpen(false)} />
    </div>
  );
}

function ToolsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-void text-starlight">
      <Navigation onWebinarsClick={() => {}} onShortsClick={() => {}} />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/library" element={
        <Suspense fallback={<main className="p-12 text-starlight">Opening the Acuity Library…</main>}>
          <LibraryPage />
        </Suspense>
      } />
      <Route path="/tools" element={<ToolsShell><ToolsIndex /></ToolsShell>} />
      <Route path="/tools/agent" element={<ToolsShell><AgentPage /></ToolsShell>} />
      <Route path="/tools/codex" element={<ToolsShell><CodexPage /></ToolsShell>} />
      <Route path="/tools/library" element={<ToolsShell><LibraryToolsPage /></ToolsShell>} />
      <Route path="/tools/search" element={<ToolsShell><SearchPage /></ToolsShell>} />
      <Route path="/tools/wisdomvault" element={<ToolsShell><WisdomVaultPage /></ToolsShell>} />
    </Routes>
  );
}
