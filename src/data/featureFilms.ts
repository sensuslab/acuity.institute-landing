export const featureFilms = {
  tools: { videoId: 'u_U7imgff5g', label: 'The Tools / Visual narrative', title: 'Many ways in. One deeper understanding.', start: 0 },
  philosophy: { videoId: 'Dv4jUE_RDSw', label: 'Our philosophy / EJF Acuity overview', title: 'Enlightening pathways of understanding.', start: 159 },
  agent: { videoId: 'AY367KDc6w8', label: 'Acuity.Agent / The inquiry', title: 'Creating pathways to wisdom.', start: 0 },
  codex: { videoId: 'i4uI8xyFUcE', label: 'Acuity.Codex / The instrument', title: 'Instruments of clarity.', start: 0 },
  search: { videoId: '8Xu80-BAER8', label: 'Acuity.Search / The discovery', title: 'Follow the thread of discovery.', start: 0 },
} as const;

export type FeatureFilmId = keyof typeof featureFilms;
