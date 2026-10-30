import { Eye, Library, Orbit, Search, Vault, type LucideIcon } from 'lucide-react';

export type ToolId = 'agent' | 'codex' | 'library' | 'search' | 'wisdomvault';

export const tools: { id: ToolId; name: string; role: string; description: string; icon: LucideIcon; live?: boolean; domain?: string }[] = [
  { id: 'agent', name: 'Acuity.Agent', role: 'The inquiry', description: 'Follow a question through sacred texts, traditions and ideas, with the evidence beside you.', icon: Eye, domain: 'agent.acuity.institute' },
  { id: 'codex', name: 'Acuity.Codex', role: 'The instrument', description: 'Shape your own knowledge bases. Connect sources, develop interpretations and create from your study.', icon: Orbit, domain: 'codex.acuity.institute' },
  { id: 'library', name: 'The Library', role: 'The foundation', description: 'An open reading room for scripture, philosophy, esoteric literature and visual study.', icon: Library, live: true },
  { id: 'search', name: 'Acuity.Search', role: 'The discovery', description: 'Look beyond familiar results. Explore the web, literature and chosen collections with evidence in view.', icon: Search, domain: 'search.acuity.institute' },
  { id: 'wisdomvault', name: 'WisdomVault', role: 'The connection', description: 'Bring the Acuity knowledge library into your own services and applications.', icon: Vault, domain: 'mcp.acuity.institute' },
];

