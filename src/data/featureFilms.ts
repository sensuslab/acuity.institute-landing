const BASE = 'https://assets.acuity.institute/library/videos/';

export const featureFilms = {
  tools: {
    src: BASE + 'tools.mp4',
    poster: BASE + 'tools-poster.jpg',
    label: 'The Tools / Visual narrative',
    title: 'Many ways in. One deeper understanding.',
  },
  toolsBottom: {
    src: BASE + 'tools-bottom.mp4',
    poster: BASE + 'tools-bottom-poster.jpg',
    label: 'The Tools / A pursuit',
    title: 'Explore. Consume. Synthesise. Personalise. Interpret.',
  },
  philosophy: {
    src: BASE + 'philosophy.mp4',
    poster: BASE + 'philosophy-poster.jpg',
    label: 'Our philosophy / EJF Acuity overview',
    title: 'Enlightening pathways of understanding.',
  },
  agent: {
    src: BASE + 'agent.mp4',
    poster: BASE + 'agent-poster.jpg',
    label: 'Acuity.Agent / The inquiry',
    title: 'Creating pathways to wisdom.',
  },
  codex: {
    src: BASE + 'codex.mp4',
    poster: BASE + 'codex-poster.jpg',
    label: 'Acuity.Codex / The instrument',
    title: 'Instruments of clarity.',
  },
  search: {
    src: BASE + 'search.mp4',
    poster: BASE + 'search-poster.jpg',
    label: 'Acuity.Search / The discovery',
    title: 'Follow the thread of discovery.',
  },
} as const;

export type FeatureFilmId = keyof typeof featureFilms;
