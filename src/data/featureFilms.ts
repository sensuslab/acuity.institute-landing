export const featureFilms = {
  tools: {
    src: '/videos/tools.mp4',
    poster: '/videos/tools-poster.jpg',
    label: 'The Tools / Visual narrative',
    title: 'Many ways in. One deeper understanding.',
  },
  toolsBottom: {
    src: '/videos/tools-bottom.mp4',
    poster: '/videos/tools-bottom-poster.jpg',
    label: 'The Tools / A pursuit',
    title: 'Explore. Consume. Synthesise. Personalise. Interpret.',
  },
  philosophy: {
    src: '/videos/philosophy.mp4',
    poster: '/videos/philosophy-poster.jpg',
    label: 'Our philosophy / EJF Acuity overview',
    title: 'Enlightening pathways of understanding.',
  },
  agent: {
    src: '/videos/agent.mp4',
    poster: '/videos/agent-poster.jpg',
    label: 'Acuity.Agent / The inquiry',
    title: 'Creating pathways to wisdom.',
  },
  codex: {
    src: '/videos/codex.mp4',
    poster: '/videos/codex-poster.jpg',
    label: 'Acuity.Codex / The instrument',
    title: 'Instruments of clarity.',
  },
  search: {
    src: '/videos/search.mp4',
    poster: '/videos/search-poster.jpg',
    label: 'Acuity.Search / The discovery',
    title: 'Follow the thread of discovery.',
  },
} as const;

export type FeatureFilmId = keyof typeof featureFilms;
