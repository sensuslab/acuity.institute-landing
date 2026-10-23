import { FormEvent, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Hexagon, Quote, Search, Sparkles } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
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
  { icon: Search, title: 'Search', text: 'Find passages across more than 20,000 sacred texts by idea, not only by keyword.' },
  { icon: Sparkles, title: 'Discover', text: 'Follow a theme from one tradition into another and surface what you did not know to look for.' },
  { icon: Quote, title: 'Understand', text: 'Receive answers grounded in the sources, with every claim traceable to the text it came from.' },
];

const inputClass =
  'w-full bg-transparent border-b border-white/10 focus:border-gold/70 outline-none py-3 text-[15px] text-starlight placeholder-starlight/30 transition-colors font-light';
const labelClass = 'block font-mono text-[10px] tracking-[0.2em] uppercase text-starlight/45 mb-2';

export default function AgentSection() {
  const { ref, isVisible } = useScrollReveal(0.1);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const interest = String(data.get('interest') ?? '').trim();
    const updatesOptIn = data.get('updates') === 'on';

    if (!name || !email) {
      setError('Please add your name and email.');
      return;
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      setError('Please enter a valid email address.');
      return;
    }
    if (name.length > 100 || interest.length > 1000) {
      setError('Name or note is too long.');
      return;
    }

    setSending(true);
    setError(null);
    const result = await postSubmission(
      buildAgentWaitlistPayload({
        submissionId: getOrCreateSubmissionId(SUBMISSION_KEY),
        name,
        email,
        interest,
        updatesOptIn,
      }),
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

  const fade = `transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`;

  return (
    <section id="agent" className="relative py-32 md:py-40 px-6 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 30% 40%, rgba(212,168,67,0.07) 0%, rgba(124,92,224,0.05) 35%, transparent 65%)',
        }}
      />
      <div ref={ref} className="relative max-w-6xl mx-auto">
        <div className="glass-card rounded-[28px] p-8 md:p-14 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <div className={`md:col-span-7 ${fade}`}>
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-gold/60">
              <Hexagon className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
              Acuity.Agent · Waitlist open
            </span>
            <h2 className="mt-5 font-display italic font-light text-[40px] md:text-[56px] leading-[1.05] text-starlight">
              Pathways
              <br />
              <span className="text-gradient-gold">to wisdom.</span>
            </h2>
            <p className="mt-8 max-w-[52ch] text-[15px] leading-[1.75] text-starlight/55 font-light">
              Acuity.Agent is an AI agent that extends the Institute, built to assist the
              search, discovery and understanding of more than 20,000 sacred texts. It reads
              alongside you: patient, precise, and always pointing back to the source.
            </p>

            <ul className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {CAPABILITIES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="border-t border-white/[0.08] pt-5">
                  <Icon className="w-4 h-4 text-gold mb-3" strokeWidth={1.5} />
                  <h3 className="text-base text-starlight tracking-tight">{title}</h3>
                  <p className="mt-2 text-[13px] text-starlight/50 font-light leading-relaxed">{text}</p>
                </li>
              ))}
            </ul>

            <a
              href={AGENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-starlight/40 hover:text-gold transition-colors"
            >
              agent.acuity.institute <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className={`md:col-span-5 ${fade}`} style={{ transitionDelay: '200ms' }}>
            {done ? (
              <div className="flex flex-col items-start gap-5 py-8">
                <CheckCircle2 size={24} className="text-gold" />
                <h3 className="font-display text-[28px] text-starlight">You are on the list.</h3>
                <p className="text-[15px] leading-[1.65] text-starlight/50 max-w-[40ch] font-light">
                  Thank you. We will write to you personally when a place opens for
                  Acuity.Agent.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-7" noValidate aria-labelledby="agent-waitlist-title">
                <h3 id="agent-waitlist-title" className="font-display text-[28px] text-starlight leading-tight">
                  Join the waitlist
                </h3>
                <div>
                  <label htmlFor="agent-name" className={labelClass}>
                    Name<span className="ml-1 text-gold/80" aria-hidden> *</span>
                  </label>
                  <input id="agent-name" name="name" required maxLength={100} autoComplete="name" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="agent-email" className={labelClass}>
                    Email<span className="ml-1 text-gold/80" aria-hidden> *</span>
                  </label>
                  <input id="agent-email" name="email" type="email" required maxLength={254} autoComplete="email" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="agent-interest" className={labelClass}>
                    What would you explore? <span className="normal-case tracking-normal text-starlight/30">(optional)</span>
                  </label>
                  <textarea
                    id="agent-interest"
                    name="interest"
                    rows={3}
                    maxLength={1000}
                    className={inputClass}
                    placeholder="A tradition, a question, a text you return to."
                  />
                </div>
                <label className="flex items-start gap-3 text-[13px] text-starlight/50 font-light cursor-pointer">
                  <input type="checkbox" name="updates" className="mt-1 accent-[#d4a843]" />
                  Also send me occasional Acuity Institute updates.
                </label>

                {error && (
                  <p role="alert" className="text-[13px] text-gold">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  aria-busy={sending}
                  className="inline-flex items-center justify-between gap-4 bg-gold text-void rounded-full px-6 py-3.5 text-[12px] font-mono uppercase tracking-[0.16em] hover:bg-gold-light transition-colors disabled:opacity-60 min-h-[44px]"
                >
                  <span>{sending ? 'Registering…' : 'Join waitlist'}</span>
                  <ArrowUpRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
