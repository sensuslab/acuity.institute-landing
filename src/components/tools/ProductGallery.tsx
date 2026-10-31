import './product-gallery.css';
import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Expand, X } from 'lucide-react';

export type ProductScreen = { file: string; title: string; text: string; alt: string };

export default function ProductGallery({ product, screens, initial = 0 }: { product: 'codex' | 'search'; screens: ProductScreen[]; initial?: number }) {
  const [active, setActive] = useState(initial);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const id = 'product-view-' + useId().replace(/:/g, '');
  const screen = screens[active];
  const image = (file: string, thumbnail = false) => '/tools/screenshots/' + product + '/' + file + (thumbnail ? '-thumb' : '') + '.webp';
  const move = (direction: number) => setActive(index => (index + direction + screens.length) % screens.length);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (expanded) element.showModal();
    else if (element.open) element.close();
  }, [expanded]);
  return <div className="product-gallery">
    <div className="product-gallery-bar"><span className="tool-number">Inside Acuity.{product === 'codex' ? 'Codex' : 'Search'}</span><div><span>{String(active + 1).padStart(2, '0')} / {String(screens.length).padStart(2, '0')}</span><button type="button" aria-label="Previous product view" onClick={() => move(-1)}><ArrowLeft size={16} /></button><button type="button" aria-label="Next product view" onClick={() => move(1)}><ArrowRight size={16} /></button></div></div>
    <figure id={id} className="product-gallery-feature">
      <button ref={expandButton} type="button" className="product-gallery-expand" aria-haspopup="dialog" aria-label={'Enlarge screenshot: ' + screen.title} onClick={() => setExpanded(true)}><img src={image(screen.file)} alt={screen.alt} width="1920" height="1080" loading="lazy" /><span><Expand size={15} /> Enlarge view</span></button>
      <figcaption aria-live="polite" aria-atomic="true"><h3>{screen.title}</h3><p>{screen.text}</p></figcaption>
    </figure>
    <div className="product-gallery-thumbs" role="group" aria-label="Choose a product screenshot">{screens.map((item, index) => <button type="button" key={item.file} aria-label={'Show ' + item.title} aria-pressed={index === active} aria-controls={id} onClick={() => setActive(index)}><img src={image(item.file, true)} alt="" width="480" height="270" loading="lazy" /><span><small>{String(index + 1).padStart(2, '0')}</small>{item.title}</span></button>)}</div>
    <dialog ref={dialog} className="product-gallery-dialog" aria-label={screen.title + ' — expanded screenshot'} onCancel={() => setExpanded(false)} onClose={() => { setExpanded(false); expandButton.current?.focus(); }} onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); move(1); } else if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); } }}>
      <div className="product-dialog-bar"><span>{screen.title}</span><button type="button" autoFocus aria-label="Close expanded screenshot" onClick={() => setExpanded(false)}><X size={21} /></button></div><div className="product-dialog-scroll"><img src={expanded ? image(screen.file) : undefined} alt={screen.alt} width="1920" height="1080" /></div><div className="product-dialog-controls"><button type="button" onClick={() => move(-1)} aria-label="Previous expanded screenshot"><ArrowLeft size={17} /> Previous</button><span>{active + 1} / {screens.length}</span><button type="button" onClick={() => move(1)} aria-label="Next expanded screenshot">Next <ArrowRight size={17} /></button></div>
    </dialog>
  </div>;
}
