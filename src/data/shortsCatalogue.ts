export interface ShortEntry {
  id: string;
  title: string;
  description?: string;
  /** HTTPS .mp4 URL (CDN / Supabase Storage / etc). Do not commit video binaries to git. */
  src: string;
  poster?: string;
}

/**
 * Curated Acuity Shorts only — add entries by hand, same workflow as webinars.
 * Replace the placeholder `src` URLs with your hosted files before shipping.
 */
export const SHORTS_CATALOGUE: ShortEntry[] = [
  {
    id: 'placeholder-1',
    title: 'Acuity Short — replace me',
    description: 'Swap this src for your first hosted .mp4.',
    // Demo sample only (not Acuity content). Replace with your CDN URL.
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
  {
    id: 'placeholder-2',
    title: 'Acuity Short — replace me',
    description: 'Second placeholder. Keep order as the feed order.',
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    id: 'placeholder-3',
    title: 'Acuity Short — replace me',
    description: 'Third placeholder. Remove when real Shorts are live.',
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
];
