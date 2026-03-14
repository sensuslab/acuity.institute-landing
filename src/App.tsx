import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import ManifestoSection from './components/ManifestoSection';
import PillarsGrid from './components/PillarsGrid';
import TrustConstellation from './components/TrustConstellation';
import Footer from './components/Footer';
import GrainOverlay from './components/GrainOverlay';

export default function App() {
  return (
    <div className="min-h-screen bg-void text-starlight">
      <GrainOverlay />
      <Navigation />
      <HeroSection />
      <ManifestoSection />
      <PillarsGrid />
      <TrustConstellation />
      <Footer />
    </div>
  );
}
