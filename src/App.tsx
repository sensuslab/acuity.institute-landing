import { lazy, Suspense, useState } from 'react';
const LibraryPage = lazy(() => import('./components/LibraryPage'));
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import ManifestoSection from './components/ManifestoSection';
import LibrarySection from './components/LibrarySection';
import PillarsGrid from './components/PillarsGrid';
import AgentSection from './components/AgentSection';
import AppsSection from './components/AppsSection';
import TrustConstellation from './components/TrustConstellation';
import Contact from './components/Contact';
import Footer from './components/Footer';
import GrainOverlay from './components/GrainOverlay';
import MediaModal from './components/MediaModal';
import ShortsModal from './components/ShortsModal';

export default function App() {
  if (window.location.pathname.replace(/\/+$/, '') === '/library') {
    return <Suspense fallback={<main className="p-12 text-starlight">Opening the Acuity Library…</main>}><LibraryPage /></Suspense>;
  }
  return <HomePage />;
}

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
      <HeroSection />
      <ManifestoSection />
      <LibrarySection />
      <PillarsGrid />
      <AgentSection />
      <AppsSection />
      <TrustConstellation />
      <Contact />
      <Footer />
      <MediaModal open={mediaOpen} onClose={() => setMediaOpen(false)} />
      <ShortsModal open={shortsOpen} onClose={() => setShortsOpen(false)} />
    </div>
  );
}

