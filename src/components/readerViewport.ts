// Measure the scroll viewport, never the canvas whose insertion changes its own layout.
// Height-only notifications and subpixel jitter must not start another PDF render.
export function observeReaderViewport(element: HTMLElement, onWidth: (width: number) => void) {
  let lastWidth = 0;
  let frame: number | undefined;
  const measure = () => {
    frame = undefined;
    const width = Math.round(element.clientWidth);
    if (width > 0 && width !== lastWidth) {
      lastWidth = width;
      onWidth(width);
    }
  };
  const observer = new ResizeObserver(() => {
    if (frame === undefined) frame = requestAnimationFrame(measure);
  });
  observer.observe(element);
  measure();
  return () => {
    observer.disconnect();
    if (frame !== undefined) cancelAnimationFrame(frame);
  };
}
