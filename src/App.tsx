import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import ManifestoSection from './components/ManifestoSection';
import PillarsGrid from './components/PillarsGrid';
import TrustConstellation from './components/TrustConstellation';
import Contact from './components/Contact';
import Footer from './components/Footer';
import GrainOverlay from './components/GrainOverlay';
import MediaModal from './components/MediaModal';
import ShortsModal from './components/ShortsModal';
import LumenNousModal from './components/LumenNousModal';
import ToolsIndex from './pages/ToolsIndex';
import AgentPage from './pages/AgentPage';
import CodexPage from './pages/CodexPage';
import LibraryPage from './pages/LibraryPage';
import SearchPage from './pages/SearchPage';
import WisdomVaultPage from './pages/WisdomVaultPage';

function Home() {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [shortsOpen, setShortsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-void text-starlight">
      <GrainOverlay />
      <Navigation
        onWebinarsClick={() => setMediaOpen(true)}
        onShortsClick={() => setShortsOpen(true)}
      />
      <HeroSection />
      <ManifestoSection />
      <PillarsGrid />
      <TrustConstellation />
      <Contact />
      <Footer />
      <MediaModal open={mediaOpen} onClose={() => setMediaOpen(false)} />
      <ShortsModal open={shortsOpen} onClose={() => setShortsOpen(false)} />
      <LumenNousModal />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tools" element={
        <div className="min-h-screen bg-void text-starlight">
          <Navigation onWebinarsClick={() => {}} onShortsClick={() => {}} />
          <ToolsIndex />
        </div>
      } />
      <Route path="/tools/agent" element={
        <div className="min-h-screen bg-void text-starlight">
          <Navigation onWebinarsClick={() => {}} onShortsClick={() => {}} />
          <AgentPage />
        </div>
      } />
      <Route path="/tools/codex" element={
        <div className="min-h-screen bg-void text-starlight">
          <Navigation onWebinarsClick={() => {}} onShortsClick={() => {}} />
          <CodexPage />
        </div>
      } />
      <Route path="/tools/library" element={
        <div className="min-h-screen bg-void text-starlight">
          <Navigation onWebinarsClick={() => {}} onShortsClick={() => {}} />
          <LibraryPage />
        </div>
      } />
      <Route path="/tools/search" element={
        <div className="min-h-screen bg-void text-starlight">
          <Navigation onWebinarsClick={() => {}} onShortsClick={() => {}} />
          <SearchPage />
        </div>
      } />
      <Route path="/tools/wisdomvault" element={
        <div className="min-h-screen bg-void text-starlight">
          <Navigation onWebinarsClick={() => {}} onShortsClick={() => {}} />
          <WisdomVaultPage />
        </div>
      } />
    </Routes>
  );
}
