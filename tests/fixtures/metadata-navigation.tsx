/* eslint-disable react-refresh/only-export-components -- This test-only mount helper is not hot-reloaded. */
import { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useNavigate, type NavigateFunction } from 'react-router-dom';
import RouteMetadata from '../../src/components/RouteMetadata';

function CaptureNavigation({ onReady }: { onReady: (navigate: NavigateFunction) => void }) {
  const navigate = useNavigate();
  useEffect(() => { onReady(navigate); }, [navigate, onReady]);
  return <RouteMetadata />;
}

export async function mountMetadataNavigation(container: HTMLElement, initialPath: string) {
  const root = createRoot(container);
  let navigate: NavigateFunction;
  const onReady = (value: NavigateFunction) => { navigate = value; };
  await act(async () => {
    root.render(<MemoryRouter initialEntries={[initialPath]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CaptureNavigation onReady={onReady} /></MemoryRouter>);
  });
  return {
    async go(destination: string | number) {
      await act(async () => { if (typeof destination === 'number') navigate(destination); else navigate(destination); });
    },
    async close() { await act(async () => root.unmount()); },
  };
}
