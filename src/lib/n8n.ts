/**
 * Shared client for the "Acuity Institute — Updates & Enquiries" n8n workflow
 * (webhook path: acuity-contact). The workflow validates schema 1.0 payloads:
 * submission_type must be 'enquiry' | 'updates', submission_id a UUID,
 * submitted_at an ISO timestamp and page_url exactly https://acuity.institute.
 */
export const WEBHOOK_URL =
  (import.meta.env.VITE_N8N_CONTACT_WEBHOOK_URL as string | undefined) ||
  'https://n8n-production-f93d.up.railway.app/webhook/acuity-contact';

export const PAGE_URL = 'https://acuity.institute';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function newSubmissionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateSubmissionId(key: string): string {
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = newSubmissionId();
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return newSubmissionId();
  }
}

export function clearSubmissionId(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export type SubmissionResult = { ok: true } | { ok: false; error: string };

const FALLBACK_ERROR = 'Something went wrong. Please retry, or email hello@acuity.institute.';

export async function postSubmission(payload: Record<string, unknown>): Promise<SubmissionResult> {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => null)) as
      | { errors?: string[]; message?: string }
      | null;
    if (res.status === 201 || res.status === 200) return { ok: true };
    if (res.status === 400) {
      return { ok: false, error: body?.errors?.join(' ') || 'Please check the form and try again.' };
    }
    return { ok: false, error: body?.message || FALLBACK_ERROR };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export const AGENT_WAITLIST_LABEL = 'Acuity.Agent Waitlist Registration';

/** Builds a waitlist payload that the existing enquiry workflow accepts unchanged. */
export function buildAgentWaitlistPayload(input: {
  submissionId: string;
  name: string;
  email: string;
  interest?: string;
  updatesOptIn?: boolean;
}) {
  const lines = [
    `[${AGENT_WAITLIST_LABEL}]`,
    `${input.name} would like to join the Acuity.Agent waitlist.`,
  ];
  if (input.interest) lines.push('', `What they hope to explore: ${input.interest}`);
  return {
    schema_version: '1.0',
    submission_id: input.submissionId,
    submission_type: 'enquiry',
    name: input.name,
    email: input.email,
    message: lines.join('\n'),
    updates_opt_in: Boolean(input.updatesOptIn),
    submitted_at: new Date().toISOString(),
    page_url: PAGE_URL,
    // Extra labelling fields; ignored by the current workflow validator but
    // available for routing if the workflow is later extended.
    subject: AGENT_WAITLIST_LABEL,
    registration_type: 'acuity-agent-waitlist',
  };
}
