import { FormEvent, useState } from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import {
  EMAIL_RE,
  PAGE_URL,
  clearSubmissionId,
  getOrCreateSubmissionId,
  postSubmission,
} from '../lib/n8n';

const SUBMISSION_KEY = 'acuity-contact-submission-id';

export default function Contact() {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    if (!name || !email || !message) {
      setError('Please fill in name, email, and a short message.');
      return;
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      setError('Please enter a valid email address.');
      return;
    }
    if (name.length > 100 || message.length > 4000) {
      setError('Name or message is too long.');
      return;
    }

    setSending(true);
    setError(null);

    const payload = {
      schema_version: '1.0',
      submission_id: getOrCreateSubmissionId(SUBMISSION_KEY),
      submission_type: 'enquiry',
      name,
      email,
      message,
      updates_opt_in: false,
      submitted_at: new Date().toISOString(),
      page_url: PAGE_URL,
    };

    const result = await postSubmission(payload);
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
    <section id="contact" className="relative pt-8 pb-8 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="glass-card rounded-[28px] p-8 md:p-14 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold/80 mb-6">
              Correspondence
            </p>
            <h2 className="font-display italic font-light text-[40px] md:text-[56px] leading-[1.05] text-starlight">
              A quiet
              <br />
              <span className="text-gradient-gold">inquiry.</span>
            </h2>
            <p className="mt-8 max-w-[42ch] text-[15px] leading-[1.7] text-starlight/50 font-light">
              Tell us what you are seeking — a conversation, a collaboration, or a
              question the Institute should sit with. You will hear back personally.
            </p>
          </div>

          <div className="md:col-span-7">
            {done ? (
              <div className="flex flex-col items-start gap-5 py-8">
                <CheckCircle2 size={24} className="text-gold" />
                <h3 className="font-display text-[28px] text-starlight">
                  Received. Thank you.
                </h3>
                <p className="text-[15px] leading-[1.65] text-starlight/50 max-w-[44ch] font-light">
                  We will reply personally. If the matter is urgent, write directly
                  to hello@acuity.institute.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-7" noValidate>
                <Field name="name" label="Name" required maxLength={100} />
                <Field name="email" label="Email" type="email" required maxLength={254} />
                <Field name="message" label="Message" textarea required maxLength={4000} />

                {error && (
                  <p id="contact-error" role="alert" className="text-[13px] text-gold">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  aria-busy={sending}
                  className="inline-flex items-center justify-between gap-4 bg-gold text-void rounded-full px-6 py-3.5 text-[12px] font-mono uppercase tracking-[0.16em] hover:bg-gold-light transition-colors disabled:opacity-60 min-h-[44px]"
                >
                  <span className="inline-flex items-center gap-2">
                    {sending && (
                      <span
                        aria-hidden
                        className="inline-flex h-2 w-2 rounded-full bg-void animate-pulse"
                      />
                    )}
                    {sending ? 'Sending…' : 'Send message'}
                  </span>
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

function Field({
  name,
  label,
  type = 'text',
  textarea,
  required,
  maxLength,
}: {
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  required?: boolean;
  maxLength?: number;
}) {
  const base =
    'w-full bg-transparent border-b border-white/10 focus:border-gold/70 outline-none py-3 text-[15px] text-starlight placeholder-starlight/30 transition-colors font-light';
  const fieldId = `field-${name}`;
  return (
    <div className="block">
      <label
        htmlFor={fieldId}
        className="block font-mono text-[10px] tracking-[0.2em] uppercase text-starlight/45 mb-2"
      >
        {label}
        {required && (
          <span className="ml-1 text-gold/80" aria-hidden>
            {' '}
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {textarea ? (
        <textarea
          id={fieldId}
          name={name}
          rows={4}
          required={required}
          maxLength={maxLength}
          className={base}
          placeholder="A few sentences is plenty."
        />
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          required={required}
          maxLength={maxLength}
          autoComplete={name === 'email' ? 'email' : name === 'name' ? 'name' : undefined}
          className={base}
        />
      )}
    </div>
  );
}
