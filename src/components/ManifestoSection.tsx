import { useScrollReveal } from '../hooks/useScrollReveal';
import ScrollFilm from './ScrollFilm';

export default function ManifestoSection() {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <section
      id="manifesto"
      className="relative py-40 md:py-56 flex items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(20,17,31,0.4) 0%, transparent 60%)',
        }}
      />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-[40%]"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(212,168,67,0.25), transparent)',
        }}
      />

      <div ref={ref} className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <p
          className={`text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-[1.3] text-starlight transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Achieving wisdom through{' '}
          <span className="italic text-gold">knowledge</span>.
        </p>

        <p
          className={`text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-[1.3] text-starlight mt-2 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          Enlightening pathways of{' '}
          <span className="italic text-gold">understanding</span>.
        </p>

        <div className="manifesto-film"><ScrollFilm film="philosophy" compact /></div>

        <div
          className={`mt-10 w-8 h-px bg-gold/30 mx-auto transition-all duration-700 ${
            isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`}
          style={{ transitionDelay: '500ms' }}
        />

        <p
          className={`mt-10 text-lg md:text-xl font-light text-starlight/40 leading-relaxed max-w-md mx-auto transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          The Acuity Library offers information as a pathway to individual
          enlightenment, aiming to improve lives, communities and society as a
          whole.
        </p>
      </div>

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-[30%]"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(212,168,67,0.15), transparent)',
        }}
      />
    </section>
  );
}
