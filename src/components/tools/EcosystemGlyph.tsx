import { useId } from 'react';
import { ToolIllustration } from './ToolIllustration';
import type { EcosystemId } from './ecosystemDirectory';

export default function EcosystemGlyph({ kind }: { kind: EcosystemId }) {
  const id = 'ecosystem-' + useId().replace(/:/g, '');
  if (kind === 'library' || kind === 'agent' || kind === 'search' || kind === 'codex' || kind === 'wisdomvault') return <ToolIllustration kind={kind} emblem />;
  return <svg viewBox="0 0 440 430" fill="none" role="img" aria-label={kind === 'media' ? 'A golden play symbol in a geometric frame' : kind === 'lumennous' ? 'A luminous pendulum suspended within celestial orbits' : 'A golden celestial wheel with a guiding star'}>
    <defs><linearGradient id={id} x1="0" x2=".8" y2="1"><stop stopColor="#fff4cb" /><stop offset=".5" stopColor="#d4a94a" /><stop offset="1" stopColor="#85632b" /></linearGradient><radialGradient id={id + '-light'}><stop stopColor="#e9c675" stopOpacity=".15" /><stop offset="1" stopColor="#d4a94a" stopOpacity="0" /></radialGradient></defs>
    <circle cx="220" cy="215" r="190" fill={'url(#' + id + '-light)'} />
    <g stroke={'url(#' + id + ')'} strokeWidth="2">
      {kind === 'media' ? <><rect x="91" y="93" width="258" height="244" rx="5" /><rect x="104" y="106" width="232" height="218" rx="2" opacity=".4" /><circle cx="220" cy="215" r="78" /><circle cx="220" cy="215" r="88" opacity=".3" /><path d="M204 178L255 215L204 251Z" fill="#d4a94a" fillOpacity=".3" />{[91,349].flatMap(x => [93,337].map(y => <circle key={x + ':' + y} cx={x} cy={y} r="5" fill="#e9cb8a" />))}</> : null}
      {kind === 'lumennous' ? <><path d="M94 278V178a126 126 0 0 1 252 0V278M220 50V233" opacity=".6" /><path d="M114 278V178a106 106 0 0 1 212 0V278" opacity=".25" /><ellipse cx="220" cy="278" rx="166" ry="41" strokeDasharray="3 6" opacity=".5" /><path d="M220 233C161 239 179 296 220 337C261 296 279 239 220 233Z" fill="#d4a94a" fillOpacity=".16" /><path d="M220 238V330" /><circle cx="220" cy="222" r="9" fill="#e9cb8a" /><path d="M220 38V64M207 51H233" /><circle cx="94" cy="278" r="4" fill="#e9cb8a" /><circle cx="346" cy="278" r="4" fill="#e9cb8a" /></> : null}
      {kind === 'myaeon' ? <><circle cx="220" cy="215" r="151" /><circle cx="220" cy="215" r="130" opacity=".4" /><circle cx="220" cy="215" r="78" opacity=".7" />{Array.from({length:12},(_,i) => <g key={i} transform={'rotate(' + (i*30) + ' 220 215)'}><path d="M220 65V82M220 90V97" opacity=".7" /><circle cx="220" cy="112" r="3" fill="#e9cb8a" /></g>)}<path d="M220 154L229 204L281 215L229 225L220 276L210 225L159 215L210 204Z" fill="#e4c078" fillOpacity=".22" /><path d="M177 172L263 258M177 258L263 172" opacity=".4" /><circle cx="220" cy="215" r="7" fill="#f3d795" /></> : null}
    </g>
  </svg>;
}
