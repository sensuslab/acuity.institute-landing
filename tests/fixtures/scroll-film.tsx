import { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import ScrollFilm from '../../src/components/ScrollFilm';
import ManifestoSection from '../../src/components/ManifestoSection';
import type { FeatureFilmId } from '../../src/data/featureFilms';
export { setFilmOverlayActive } from '../../src/components/youtubePlayer';

export function renderPhilosophy() { return renderToStaticMarkup(<ManifestoSection />); }
export async function mountFilms(container: HTMLElement, films: FeatureFilmId[] = ['codex']) {
  const root = createRoot(container);
  const render = async (items: FeatureFilmId[]) => {
    await act(async () => { root.render(<StrictMode>{items.map(film => <ScrollFilm key={film} film={film} />)}</StrictMode>); });
  };
  await render(films);
  return {
    render,
    async step(action: () => void) { await act(async () => { action(); }); },
    async click(film = films[0]) { await act(async () => { container.querySelector<HTMLButtonElement>('[data-film="' + film + '"] button')!.click(); }); },
    async close() { await act(async () => { root.unmount(); }); },
  };
}
