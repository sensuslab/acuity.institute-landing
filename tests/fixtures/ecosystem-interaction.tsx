import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import EcosystemMap from '../../src/components/tools/EcosystemMap';

export async function mountEcosystem(container: HTMLElement) {
  const root = createRoot(container);
  await act(async () => { root.render(<MemoryRouter><EcosystemMap /></MemoryRouter>); });
  return {
    async select(name: string) {
      await act(async () => { container.querySelector<HTMLButtonElement>('[aria-label="About ' + name + '"]')!.click(); });
    },
    async hover(id: string) {
      await act(async () => {
        const event = new Event('pointerover', { bubbles: true });
        Object.defineProperty(event, 'pointerType', { value: 'mouse' });
        container.querySelector('.eco-node-' + id)!.dispatchEvent(event);
      });
    },
    async close() { await act(async () => { root.unmount(); }); },
  };
}
