import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BookOpenText,
  CheckCircle2,
  Eye,
  FileText,
  GitCompareArrows,
  Library,
  Paperclip,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { SectionLabel, Stardust } from './SectionChrome';
import {
  EMAIL_RE,
  buildAgentWaitlistPayload,
  clearSubmissionId,
  getOrCreateSubmissionId,
  postSubmission,
} from '../lib/n8n';

const SUBMISSION_KEY = 'acuity-agent-waitlist-submission-id';
const AGENT_URL = 'https://agent.acuity.institute';

const CAPABILITIES = [
  { icon: Library, title: 'Explore the library', text: 'Find passages, concepts and related teachings across more than 20,000 sacred texts.' },
  { icon: GitCompareArrows, title: 'Compare traditions', text: 'See shared themes and differing interpretations, each held in its own textual context.' },
  { icon: FileText, title: 'Develop useful material', text: 'Draft analyses, talks, teaching notes and briefings grounded in the passages retrieved.' },
  { icon: Eye, title: 'Follow the research', text: 'Inspect each search step alongside the citations that support the answer.' },
  { icon: SlidersHorizontal, title: 'Shape the assistant', text: 'Set your own instructions, response style, language and citation format.' },
  { icon: Paperclip, title: 'Work with attachments', text: 'Bring your own files into a conversation. They stay private to you.' },
];

const QUESTIONS = [
  'Trace the relationship between wisdom, practice, and transformation.',
  'Compare guidance on inner peace across the available traditions, with source passages.',
  'Find material for a talk on creating pathways to wisdom.',
  "Distinguish what this text says from the translator's commentary.",
  'Prepare a concise briefing and identify where the evidence is incomplete.',
];

const STEPS = [
  { title: 'Search', text: 'Locates relevant material in the knowledge library.' },
  { title: 'Read', text: 'Inspects passages and their surrounding context.' },
  { title: 'Synthesise', text: 'Connects the evidence to your question and cites its sources.' },
  { title: 'Clarify limits', text: 'Separates quotation from interpretation, and says plainly when evidence cannot be found.' },
];

export default function AgentSection() {
  const { ref, isVisible } = useScrollReveal(0.05);
  const [open, setOpen] = useState(false);
  const fade = (d = 0) => ({
    className: `transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`,
    style: { transitionDelay: `${d}ms` },
  });

  return (
    <section id="agent" aria-labelledby="agent-title" className="relative py-28 md:py-36 overflow-hidden">
      {/* Nebula atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 75% 18%, rgba(124,92,224,0.16) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 15% 55%, rgba(60,90,170,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 50% 8%, rgba(212,168,67,0.10) 0%, transparent 70%), linear-gradient(180deg, #0b0a16 0%, #09090f 100%)',
        }}
      />
      <Stardust count={60} seed={3} />

      <div ref={ref} className="relative max-w-6xl mx-auto px-6">
        {/* Product hero */}
        <div className="text-center">
          <div {...fade(0)}>
            <SectionLabel index="02">Acuity.Agent · Waitlist open</SectionLabel>
          </div>
          <h2
            id="agent-title"
            className={`mt-6 font-display font-light text-[54px] md:text-[88px] leading-none tracking-tight text-starlight ${fade(100).className}`}
            style={{ ...fade(100).style, textShadow: '0 0 40px rgba(212,168,67,0.25)' }}
          >
            Acuity<span className="text-gradient-gold">.Agent</span>
          </h2>
          <p className={`mt-5 font-display italic text-2xl md:text-3xl text-gold-light/90 ${fade(200).className}`} style={fade(200).style}>
            Creating Pathways to Wisdom
          </p>
          <p className={`mt-6 mx-auto max-w-[56ch] text-[15px] leading-[1.75] text-starlight/55 font-light ${fade(300).className}`} style={fade(300).style}>
            An AI research assistant, extending the Institute, for the search, discovery and
            understanding of more than 20,000 sacred texts.
          </p>
          <div className={`mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 ${fade(400).className}`} style={fade(400).style}>
            <WaitlistButton onClick={() => setOpen(true)} />
            <a
              href={AGENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-starlight/45 hover:text-gold transition-colors min-h-[44px]"
            >
              agent.acuity.institute <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        <figure className={`relative mt-14 md:mt-20 ${fade(500).className}`} style={fade(500).style}>
          <div aria-hidden className="absolute -inset-x-10 -top-10 h-2/3 blur-3xl opacity-60" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(212,168,67,0.22), transparent 65%)' }} />
          <picture>
            <source type="image/webp" srcSet="/agent/agent-hero-960.webp 960w, /agent/agent-hero-1600.webp 1600w" sizes="(min-width: 1152px) 1104px, 100vw" />
            <img
              src="/agent/agent-hero-1600.webp"
              alt="Acuity.Agent open on a desktop monitor and a phone, with suggested research questions beneath the search field"
              width={1600}
              height={893}
              loading="lazy"
              decoding="async"
              className="relative w-full h-auto rounded-[24px] border border-gold/40 shadow-[0_0_60px_rgba(212,168,67,0.15),0_40px_80px_-30px_rgba(0,0,0,0.9)]"
            />
          </picture>
        </figure>

        {/* Description */}
        <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center">
          <div className="md:col-span-6">
            <h3 className="font-display italic font-light text-[34px] md:text-[44px] leading-[1.08] text-starlight">
              From question <span className="text-gradient-gold">to understanding.</span>
            </h3>
            <div className="mt-6 space-y-4 text-[15px] leading-[1.75] text-starlight/55 font-light">
              <p>
                Acuity.Agent is the Institute's knowledge assistant for exploring sacred texts,
                philosophy and spiritual traditions. It turns questions into research, source
                passages into understanding, and understanding into material for reflection,
                teaching and practical application.
              </p>
              <p>
                It searches the library, reads the relevant passages and develops answers with
                traceable references. Its purpose is thoughtful inquiry: comparing ideas,
                respecting the differences between traditions, and making the evidence behind
                every interpretation visible.
              </p>
            </div>
          </div>
          <div className="md:col-span-6">
            <picture>
              <source type="image/webp" srcSet="/agent/agent-archive-800.webp 800w, /agent/agent-archive-1400.webp 1400w" sizes="(min-width: 768px) 540px, 100vw" />
              <img
                src="/agent/agent-archive-1400.webp"
                alt="A floating glass panel showing The Archive: source passages from the Bhagavad Gita arranged in cards"
                width={1400}
                height={781}
                loading="lazy"
                decoding="async"
                className="w-full h-auto rounded-[20px] border border-gold/30"
              />
            </picture>
          </div>
        </div>

        {/* Capability grid */}
        <div className="mt-20 md:mt-28">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-starlight/40 text-center">What it does</p>
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {CAPABILITIES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="glow-panel rounded-2xl p-7">
                <div className="w-10 h-10 rounded-xl border border-gold/30 bg-gold/[0.06] flex items-center justify-center mb-5">
                  <Icon className="w-[18px] h-[18px] text-gold" strokeWidth={1.4} />
                </div>
                <h4 className="text-[17px] text-starlight tracking-tight">{title}</h4>
                <p className="mt-2 text-[13.5px] text-starlight/50 font-light leading-relaxed">{text}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Sample questions + phone art */}
        <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center">
          <div className="md:col-span-6 md:order-2">
            <h3 className="font-display italic font-light text-[32px] md:text-[40px] leading-[1.1] text-starlight">
              Questions to begin with
            </h3>
            <ul className="mt-6 space-y-3">
              {QUESTIONS.map((q) => (
                <li key={q} className="flex gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3.5 text-[14px] text-starlight/70 font-light leading-snug">
                  <BookOpenText className="w-4 h-4 mt-0.5 shrink-0 text-gold/80" strokeWidth={1.4} />
                  <span>“{q}”</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-6 md:order-1">
            <picture>
              <source type="image/webp" srcSet="/agent/agent-phone-640.webp 640w, /agent/agent-phone-1024.webp 1024w" sizes="(min-width: 768px) 540px, 100vw" />
              <img
                src="/agent/agent-phone-1024.webp"
                alt="Acuity.Agent on a phone resting on dark rock, answering a question with cited sources"
                width={1024}
                height={571}
                loading="lazy"
                decoding="async"
                className="w-full h-auto rounded-[20px] border border-gold/30"
              />
            </picture>
          </div>
        </div>

        {/* How the research works */}
        <div className="mt-20 md:mt-28">
          <h3 className="text-center font-display italic font-light text-[32px] md:text-[40px] text-starlight">
            How the research works
          </h3>
          <ol className="relative mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            <div aria-hidden className="hidden lg:block absolute top-[34px] left-[12%] right-[12%] h-px bg-gradient-to-r from-gold/10 via-gold/50 to-gold/10" />
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative text-center px-4">
                <div className="relative mx-auto w-[68px] h-[68px] rounded-full border border-gold/50 bg-void flex items-center justify-center shadow-[0_0_30px_rgba(212,168,67,0.18)]">
                  <span className="font-display text-[28px] text-gold-light">{i + 1}</span>
                </div>
                <h4 className="mt-5 text-[17px] text-starlight">{s.title}</h4>
                <p className="mt-2 text-[13.5px] text-starlight/50 font-light leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-starlight/35">
            Answers are grounded in the Library's sacred-text archive, with recorded provenance.
          </p>
        </div>

        {/* Closing CTA */}
        <div className="mt-20 md:mt-24 glow-panel rounded-[28px] px-8 py-12 md:py-14 text-center">
          <p className="font-display italic text-[30px] md:text-[40px] leading-tight text-starlight">
            Be among the first to <span className="text-gradient-gold">walk the pathway.</span>
          </p>
          <p className="mt-4 mx-auto max-w-[48ch] text-[14px] text-starlight/50 font-light">
            Places are opening gradually. Join the waitlist and we will write to you personally when yours is ready.
          </p>
          <div className="mt-8 flex justify-center">
            <WaitlistButton onClick={() => setOpen(true)} />
          </div>
        </div>
      </div>

      <WaitlistDialog open={open} onClose={() => setOpen(false)} />
    </section>
  );
}

function WaitlistButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className="group inline-flex items-center gap-3 bg-gold text-void rounded-full px-8 py-4 text-[12px] font-mono uppercase tracking-[0.18em] hover:bg-gold-light transition-all shadow-[0_0_40px_rgba(212,168,67,0.35)] hover:shadow-[0_0_60px_rgba(232,201,106,0.5)] min-h-[48px]"
    >
      Join the waitlist
      <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </button>
  );
}

const inputClass =
  'w-full bg-transparent border-b border-white/10 focus:border-gold/70 outline-none py-3 text-[15px] text-starlight placeholder-starlight/30 transition-colors font-light';
const labelClass = 'block font-mono text-[10px] tracking-[0.2em] uppercase text-starlight/45 mb-2';

function WaitlistDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const interest = String(data.get('interest') ?? '').trim();
    const updatesOptIn = data.get('updates') === 'on';

    if (!name || !email) return setError('Please add your name and email.');
    if (!EMAIL_RE.test(email) || email.length > 254) return setError('Please enter a valid email address.');
    if (name.length > 100 || interest.length > 1000) return setError('Name or note is too long.');

    setSending(true);
    setError(null);
    const result = await postSubmission(
      buildAgentWaitlistPayload({ submissionId: getOrCreateSubmissionId(SUBMISSION_KEY), name, email, interest, updatesOptIn }),
    );
    setSending(false);
    if (result.ok) {
      clearSubmissionId(SUBMISSION_KEY);
      setDone(true);
      form.reset();
    } else {
      setError(result.error);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
      aria-labelledby="agent-waitlist-title"
      className="agent-dialog m-auto w-[min(92vw,30rem)] max-h-[92vh] overflow-y-auto rounded-[28px] border border-gold/45 bg-transparent p-0 text-starlight backdrop:bg-void/85 backdrop:backdrop-blur-md"
      style={{ background: 'linear-gradient(180deg, #17142a 0%, #0e0c1a 55%, #09090f 100%)', boxShadow: '0 0 80px rgba(212,168,67,0.18), 0 30px 60px -20px rgba(0,0,0,0.9)' }}
    >
      <div className="relative p-8 md:p-10">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-starlight/40 hover:text-starlight hover:bg-white/[0.07] transition-colors">
          <X className="w-4 h-4" />
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/70">Acuity.Agent</span>
        {done ? (
          <div className="mt-6 flex flex-col items-start gap-5">
            <CheckCircle2 size={24} className="text-gold" />
            <h3 id="agent-waitlist-title" className="font-display text-[30px] text-starlight">You are on the list.</h3>
            <p className="text-[15px] leading-[1.65] text-starlight/55 font-light">
              Thank you. We will write to you personally when a place opens for Acuity.Agent.
            </p>
            <button type="button" onClick={onClose} className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gold hover:text-gold-light">Close</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-3 space-y-6" noValidate>
            <h3 id="agent-waitlist-title" className="font-display text-[34px] leading-tight text-starlight">Join the waitlist</h3>
            <p className="-mt-3 text-[14px] text-starlight/50 font-light">Reserve your place for early access.</p>
            <div>
              <label htmlFor="agent-name" className={labelClass}>Name<span className="ml-1 text-gold/80" aria-hidden> *</span></label>
              <input id="agent-name" name="name" required maxLength={100} autoComplete="name" className={inputClass} />
            </div>
            <div>
              <label htmlFor="agent-email" className={labelClass}>Email<span className="ml-1 text-gold/80" aria-hidden> *</span></label>
              <input id="agent-email" name="email" type="email" required maxLength={254} autoComplete="email" className={inputClass} />
            </div>
            <div>
              <label htmlFor="agent-interest" className={labelClass}>
                What would you explore? <span className="normal-case tracking-normal text-starlight/30">(optional)</span>
              </label>
              <textarea id="agent-interest" name="interest" rows={3} maxLength={1000} className={inputClass} placeholder="A tradition, a question, a text you return to." />
            </div>
            <label className="flex items-start gap-3 text-[13px] text-starlight/50 font-light cursor-pointer">
              <input type="checkbox" name="updates" className="mt-1 accent-[#d4a843]" />
              Also send me occasional Acuity Institute updates.
            </label>
            <p className="text-[13px] leading-relaxed text-starlight/65">
              We use your details to manage the waitlist and tell you when early access is available.{' '}
              <a href="/privacy/" target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-2">
                Privacy Policy<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
            {error && <p role="alert" className="text-[13px] text-gold">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              aria-busy={sending}
              className="w-full inline-flex items-center justify-center gap-3 bg-gold text-void rounded-full px-6 py-3.5 text-[12px] font-mono uppercase tracking-[0.16em] hover:bg-gold-light transition-colors disabled:opacity-60 min-h-[48px]"
            >
              {sending ? 'Registering…' : 'Reserve my place'}
              <ArrowUpRight size={16} />
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
