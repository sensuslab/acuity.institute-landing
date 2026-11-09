import './brand-marks.css';
import type { ToolId } from './toolDirectory';

/** Supplied Acuity product marks; functional interface icons remain Lucide. */
export default function ToolBrandMark({ kind, className = '', large = false }: { kind: ToolId; className?: string; large?: boolean }) {
  if (kind === 'wisdomvault') return null;
  return <img className={'tool-brand-mark ' + className} src={'/tools/icons/' + kind + '/' + (large ? 'icon-512.png' : 'brand-mark.png')} width={large ? 512 : 128} height={large ? 512 : 128} alt="" aria-hidden="true" loading="lazy" />;
}
