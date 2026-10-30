import { useEffect, useState, useRef } from 'react';

const STARS = Array.from({ length: 80 }, (_, i) => {
  const seed = (i + 1) * 7919;
  return {
    left: `${((seed * 13) % 1000) / 10}%`,
    top: `${((seed * 17) % 1000) / 10}%`,
    size: ((seed % 3) + 1) * 0.6,
    opacity: ((seed % 5) + 1) * 0.04,
    duration: 3 + (seed % 4),
    delay: (seed % 3000) / 1000,
  };
});

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (portalRef.current) {
            portalRef.current.style.transform = `translateY(${window.scrollY * 0.15}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0">
        {STARS.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-starlight animate-pulse-glow"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full blur-3xl animate-pulse-glow"
        style={{
          background:
            'radial-gradient(circle, rgba(124,92,224,0.08) 0%, rgba(212,168,67,0.04) 40%, transparent 70%)',
        }}
      />

      <div
        ref={portalRef}
        className={`relative transition-all duration-[1.5s] ease-out ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <Portal />
      </div>

      <div className="relative z-10 text-center mt-10 md:mt-14 px-6">
        <h1
          className={`transition-all duration-1000 ease-out ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <span className="block text-4xl md:text-6xl lg:text-7xl font-light tracking-tighter leading-[0.9] text-starlight">
            Pathways to{' '}
            <span className="font-semibold text-gradient-gold">wisdom</span>.
          </span>
        </h1>

        <p
          className={`mt-6 md:mt-8 text-base md:text-lg font-light text-starlight/50 max-w-md mx-auto leading-relaxed transition-all duration-1000 ease-out ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '800ms' }}
        >
          The Acuity Institute is dedicated to truth and the expansion of
          accurate knowledge, enlightening pathways of understanding across all
          areas of life
        </p>

        <div
          className={`mt-8 md:mt-10 transition-all duration-1000 ease-out ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '1100ms' }}
        >
          <a
            href="/library/"
            className="inline-flex items-center px-8 py-3.5 rounded-full border border-gold/50 text-gold font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:bg-gold/10 hover:border-gold hover:scale-105 hover:shadow-[0_0_30px_rgba(212,168,67,0.15)]"
          >
            Enter the Library
          </a>
        </div>
      </div>

      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-starlight/20 transition-all duration-1000 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '1400ms' }}
      >
        Est. 2026 &mdash; Fig 1.0
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background:
            'linear-gradient(to bottom, transparent, #09090f)',
        }}
      />
    </section>
  );
}

function Portal() {
  return (
    <div className="relative w-[220px] h-[320px] md:w-[280px] md:h-[400px] lg:w-[320px] lg:h-[460px]">
      <div
        className="absolute -inset-24 rounded-full blur-3xl animate-pulse-glow"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(212,168,67,0.14) 0%, rgba(124,92,224,0.06) 50%, transparent 80%)',
        }}
      />

      <div
        className="absolute -inset-10 rounded-full blur-2xl"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(212,168,67,0.08) 0%, transparent 70%)',
        }}
      />

      <svg
        viewBox="0 0 300 420"
        className="absolute inset-0 w-full h-full"
        fill="none"
      >
        <defs>
          <linearGradient id="archStroke" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#e8c96a" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#7c5ce0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d4a843" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient
            id="archStrokeInner"
            x1="0.5"
            y1="0"
            x2="0.5"
            y2="1"
          >
            <stop offset="0%" stopColor="#e8c96a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7c5ce0" stopOpacity="0.05" />
          </linearGradient>
          <radialGradient id="portalFill" cx="0.5" cy="0.35" r="0.6">
            <stop offset="0%" stopColor="#d4a843" stopOpacity="0.18" />
            <stop offset="40%" stopColor="#7c5ce0" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#09090f" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="beamGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#d4a843" stopOpacity="0" />
            <stop offset="50%" stopColor="#d4a843" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#d4a843" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M 70 420 L 70 160 A 80 80 0 0 1 230 160 L 230 420 Z"
          fill="url(#portalFill)"
        />

        <path
          d="M 70 420 L 70 160 A 80 80 0 0 1 230 160 L 230 420"
          stroke="url(#archStroke)"
          strokeWidth="1.5"
        />

        <path
          d="M 85 420 L 85 170 A 65 65 0 0 1 215 170 L 215 420"
          stroke="url(#archStrokeInner)"
          strokeWidth="0.75"
        />

        <line
          x1="150"
          y1="10"
          x2="150"
          y2="80"
          stroke="url(#beamGrad)"
          strokeWidth="1"
        />

        <circle cx="150" cy="80" r="2.5" fill="#d4a843" opacity="0.7">
          <animate
            attributeName="opacity"
            values="0.5;0.9;0.5"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="150"
          cy="80"
          r="6"
          fill="none"
          stroke="#d4a843"
          strokeWidth="0.5"
          opacity="0.2"
        >
          <animate
            attributeName="r"
            values="6;12;6"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.04;0.2"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      <svg
        viewBox="0 0 400 400"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-auto animate-spin-slow"
        fill="none"
      >
        <ellipse
          cx="200"
          cy="200"
          rx="190"
          ry="55"
          stroke="#d4a843"
          strokeWidth="0.5"
          opacity="0.12"
          strokeDasharray="4 8"
        />
        <ellipse
          cx="200"
          cy="200"
          rx="165"
          ry="40"
          stroke="#7c5ce0"
          strokeWidth="0.4"
          opacity="0.08"
          transform="rotate(15 200 200)"
          strokeDasharray="3 10"
        />
      </svg>

      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[250%] h-12 blur-2xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(212,168,67,0.12) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}

