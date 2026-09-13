export interface ShortEntry {
  id: string;
  title: string;
  description?: string;
  /** Public HTTPS .mp4 URL served from Railway /data/shorts via /shorts/* */
  src: string;
  poster?: string;
}

const SHORTS_BASE =
  (typeof import.meta !== 'undefined' &&
    (import.meta as ImportMeta & { env?: { VITE_SHORTS_BASE?: string } }).env
      ?.VITE_SHORTS_BASE) ||
  'https://acuity.institute/shorts';

function shortUrl(slug: string) {
  return `${SHORTS_BASE.replace(/\/$/, '')}/${slug}.mp4`;
}

/**
 * Curated Acuity Shorts — files live on the Railway volume at /data/shorts
 * and are served publicly at https://acuity.institute/shorts/<slug>.mp4
 */
export const SHORTS_CATALOGUE: ShortEntry[] = [
  {
    id: 'a-return-to-coherence',
    title: 'A Return to Coherence',
    src: shortUrl('a-return-to-coherence'),
  },
  {
    id: 'exploring-my-testimony-through-a-live-knowledge-graph',
    title: 'Exploring my testimony through a live knowledge graph',
    src: shortUrl('exploring-my-testimony-through-a-live-knowledge-graph'),
  },
  {
    id: 'finding-meaning-in-everyday-encounters',
    title: 'Finding meaning in everyday encounters',
    src: shortUrl('finding-meaning-in-everyday-encounters'),
  },
  {
    id: 'forgiveness-boundaries-and-the-lessons-i-needed',
    title: 'Forgiveness, boundaries and the lessons I needed',
    src: shortUrl('forgiveness-boundaries-and-the-lessons-i-needed'),
  },
  {
    id: 'god-is-ineffable',
    title: 'God Is Ineffable',
    src: shortUrl('god-is-ineffable'),
  },
  {
    id: 'gratitude-for-the-smallest-things',
    title: 'Gratitude for the Smallest Things',
    src: shortUrl('gratitude-for-the-smallest-things'),
  },
  {
    id: 'how-i-came-to-understand-my-anxiety-differently7',
    title: 'How I came to understand my anxiety differently',
    src: shortUrl('how-i-came-to-understand-my-anxiety-differently7'),
  },
  {
    id: 'how-understanding-fear-helped-me-approach-forgiveness',
    title: 'How understanding fear helped me approach forgiveness',
    src: shortUrl('how-understanding-fear-helped-me-approach-forgiveness'),
  },
  {
    id: 'if-i-cannot-find-a-solution-i-will-create-one',
    title: 'If I cannot find a solution, I will create one',
    src: shortUrl('if-i-cannot-find-a-solution-i-will-create-one'),
  },
  {
    id: 'learning-to-value-myself-differently',
    title: 'Learning to value myself differently',
    src: shortUrl('learning-to-value-myself-differently'),
  },
  {
    id: 'learning-without-claiming-to-be-the-expert',
    title: 'Learning without claiming to be the expert',
    src: shortUrl('learning-without-claiming-to-be-the-expert'),
  },
  {
    id: 'my-love-has-boundaries-now',
    title: 'My love has boundaries now',
    src: shortUrl('my-love-has-boundaries-now'),
  },
  {
    id: 'recovery-has-not-meant-thriving-every-day',
    title: 'Recovery has not meant thriving every day',
    src: shortUrl('recovery-has-not-meant-thriving-every-day'),
  },
  {
    id: 'revelation-can-be-deeply-personal',
    title: 'Revelation can be deeply personal',
    src: shortUrl('revelation-can-be-deeply-personal'),
  },
  {
    id: 'standing-firm-in-my-integrity',
    title: 'Standing firm in my integrity',
    src: shortUrl('standing-firm-in-my-integrity'),
  },
  {
    id: 'the-end-of-an-old-life-the-beginning-of-self-worth',
    title: 'The end of an old life, the beginning of self-worth',
    src: shortUrl('the-end-of-an-old-life-the-beginning-of-self-worth'),
  },
  {
    id: 'the-love-of-god-as-the-love-of-each-other',
    title: 'The love of God as the love of each other',
    src: shortUrl('the-love-of-god-as-the-love-of-each-other'),
  },
  {
    id: 'the-night-the-white-light-appeared',
    title: 'The Night the White Light Appeared',
    src: shortUrl('the-night-the-white-light-appeared'),
  },
  {
    id: 'the-real-cost-of-doomscrolling',
    title: 'The Real Cost of Doomscrolling',
    src: shortUrl('the-real-cost-of-doomscrolling'),
  },
  {
    id: 'the-truth-outlasts-the-lies',
    title: 'The Truth Outlasts the Lies',
    src: shortUrl('the-truth-outlasts-the-lies'),
  },
  {
    id: 'the-warning-i-still-remember',
    title: 'The warning I still remember',
    src: shortUrl('the-warning-i-still-remember'),
  },
  {
    id: 'turning-lived-experience-into-a-knowledge-graph',
    title: 'Turning lived experience into a knowledge graph',
    src: shortUrl('turning-lived-experience-into-a-knowledge-graph'),
  },
  {
    id: 'what-i-will-not-trade-for-comfort',
    title: 'What I will not trade for comfort',
    src: shortUrl('what-i-will-not-trade-for-comfort'),
  },
  {
    id: 'what-spiritual-alchemy-means-to-me',
    title: 'What spiritual alchemy means to me',
    src: shortUrl('what-spiritual-alchemy-means-to-me'),
  },
  {
    id: 'when-openness-meets-broken-trust',
    title: 'When openness meets broken trust',
    src: shortUrl('when-openness-meets-broken-trust'),
  },
  {
    id: 'when-speaking-up-is-part-of-your-responsibility',
    title: 'When speaking up is part of your responsibility',
    src: shortUrl('when-speaking-up-is-part-of-your-responsibility'),
  },
  {
    id: 'your-brain-is-a-conduit-not-the-whole-of-you',
    title: 'Your Brain Is a Conduit, Not the Whole of You',
    src: shortUrl('your-brain-is-a-conduit-not-the-whole-of-you'),
  },
  {
    id: 'your-peace-deserves-to-be-a-priority',
    title: 'Your peace deserves to be a priority',
    src: shortUrl('your-peace-deserves-to-be-a-priority'),
  },
];
