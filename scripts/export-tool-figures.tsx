import { renderToStaticMarkup } from 'react-dom/server';
import { ToolIllustration } from '../src/components/tools/ToolIllustration';

/** Exact figure vectors, without page chrome or captions, on an opaque black canvas. */
export const figures = [
  { kind: 'agent', file: 'fig-01-the-inquiry', title: 'FIG. 01 / THE INQUIRY' },
  { kind: 'library', file: 'fig-03-the-foundation', title: 'FIG. 03 / THE FOUNDATION' },
  { kind: 'search', file: 'fig-04-the-discovery', title: 'FIG. 04 / THE DISCOVERY' },
] as const;

export function renderFigure(kind: typeof figures[number]['kind']) {
  return renderToStaticMarkup(<ToolIllustration kind={kind} />)
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="2320" ')
    .replace(/(<svg[^>]*>)/, '$1<rect width="640" height="580" fill="#000000"/>');
}
