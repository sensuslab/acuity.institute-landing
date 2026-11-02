let overlayActive = false;
const listeners = new Set<() => void>();

export function filmOverlayActive() { return overlayActive; }

export function setFilmOverlayActive(active: boolean) {
  overlayActive = active;
  listeners.forEach(fn => fn());
}

export function onFilmOverlayChange(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
