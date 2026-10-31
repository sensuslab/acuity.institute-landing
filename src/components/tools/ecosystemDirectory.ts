export type EcosystemId = 'library' | 'media' | 'agent' | 'search' | 'codex' | 'lumennous' | 'myaeon' | 'wisdomvault';

export const ecosystem = {
  library: {
    name: 'The Library', role: 'The foundation', short: 'Sacred texts, ebooks & articles', status: 'Open access · live now',
    description: 'Begin with the works themselves. Read scripture, philosophy and esoteric literature in the virtual e-reader, consult original PDFs or enter presentation mode.',
    points: ['Read at your own pace', 'Keep editions and sources in view', 'Carry a question into deeper study'],
    href: '/tools/library', cta: 'Explore the Library',
  },
  media: {
    name: 'Webinars & Shorts', role: 'Shared learning', short: 'Talks, learning & inspiration', status: 'Watch on the homepage',
    description: 'Meet ideas through conversation, visual explanation and shorter moments of inspiration. Return to the Library to follow an idea through the original works.',
    points: ['Long-form webinars', 'Short visual reflections', 'A different way into the material'],
    href: '/?media=webinars', cta: 'Watch webinars',
  },
  agent: {
    name: 'Acuity.Agent', role: 'The inquiry', short: 'Source-grounded inquiry', status: 'Acuity.One · coming soon',
    description: 'Follow a question into sacred and esoteric texts. Locate passages, compare traditions and distinguish the original source from the interpretation.',
    points: ['Ask across traditions', 'Inspect passages and citations', 'Follow the evidence further'],
    href: '/tools/agent', cta: 'Explore Acuity.Agent',
  },
  search: {
    name: 'Acuity.Search', role: 'The discovery', short: 'Web, literature & collections', status: 'Acuity.One · coming soon',
    description: 'Look beyond familiar results. Explore the wider web, search for a particular work or focus on a chosen collection, then carry useful research into Codex.',
    points: ['General and literature discovery', 'Collections you can shape', 'Research exchange with Codex'],
    href: '/tools/search', cta: 'Explore Acuity.Search',
  },
  codex: {
    name: 'Acuity.Codex', role: 'The instrument', short: 'Organise, interpret & create', status: 'Acuity.One · coming soon',
    description: 'Make the inquiry your own. Gather sources in Context Spheres, question them through The Lens, preserve your thinking in myVault and create from your study in Studio.',
    points: ['The Archive & Context Spheres', 'The Lens & myVault', 'Studio: study material and audio'],
    href: '/tools/codex', cta: 'Explore Acuity.Codex',
  },
  lumennous: {
    name: 'LumenNous', role: 'The practice', short: 'Prayer, reflection & daily practice', status: 'Companion service · coming soon',
    description: 'Bring reflection into the rhythm of daily life through prayer, affirmations, guided practice and sacred listening, with celestial perspectives as an invitation to contemplation.',
    points: ['Prayer and affirmations', 'Guided practice and listening', 'Personal reflection, day by day'],
    href: 'https://lumennous.acuity.institute', cta: 'Visit LumenNous',
  },
  myaeon: {
    name: 'myAeon', role: 'The perspective', short: 'Personal celestial perspectives', status: 'Companion service · coming soon',
    description: 'Explore your sky as a language for self-understanding. An interactive celestial workspace brings personal chart perspectives, reflective readings and narrated listening into view.',
    points: ['Explore the celestial landscape', 'Personal chart perspectives', 'Reflection rather than prediction'],
    href: 'https://myaeon.acuity.institute', cta: 'Visit myAeon',
  },
  wisdomvault: {
    name: 'WisdomVault', role: 'The connection', short: 'Knowledge in your own applications', status: 'Under development',
    description: 'The future connection between the Acuity knowledge library and your own services. Bring passages, source discovery and cited knowledge into the places you already work.',
    points: ['Connected knowledge resources', 'Source-led discovery', 'Integration with your own applications'],
    href: null, cta: 'Under development',
  },
} satisfies Record<EcosystemId, { name: string; role: string; short: string; status: string; description: string; points: string[]; href: string | null; cta: string }>;

/** These are pathways through the Acuity vision, not claims of live data transfer. */
export const ecosystemConnections: { from: EcosystemId; to: EcosystemId; label: string }[] = [
  { from: 'library', to: 'media', label: 'Read, watch and learn' },
  { from: 'library', to: 'agent', label: 'An inquiry begins in the sources' },
  { from: 'agent', to: 'codex', label: 'Develop a personal inquiry' },
  { from: 'search', to: 'codex', label: 'Research exchange' },
  { from: 'codex', to: 'lumennous', label: 'From understanding to practice' },
  { from: 'lumennous', to: 'myaeon', label: 'Celestial reflections' },
  { from: 'library', to: 'wisdomvault', label: 'Knowledge in your own applications' },
];
