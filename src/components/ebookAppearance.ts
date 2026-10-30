export const ebookPageTones={
  white:{label:'White',background:'#ffffff'},
  soft:{label:'Soft white',background:'#faf7ef'},
  warm:{label:'Warm',background:'#f3e7d3'}
} as const;
export type EbookPageTone=keyof typeof ebookPageTones;
export const ebookAppearanceKey='acuity.ebook.appearance.v1';
export function parseEbookPageTone(value:string|null):EbookPageTone {
  try {const tone=JSON.parse(value||'null')?.pageTone;return Object.prototype.hasOwnProperty.call(ebookPageTones,tone)?tone:'white';}catch{return 'white';}
}
export function ebookReadingTheme(tone:EbookPageTone){
  return {
    'html, body':{'background':`${ebookPageTones[tone].background} !important`,'color':'#111111 !important','color-scheme':'light !important'},
    'body':{'font-family':'"Times New Roman", Times, "Liberation Serif", serif !important','line-height':'1.65 !important','padding':'0 28px !important'},
    'p, li, div, blockquote, span, td':{'color':'#111111 !important','font-family':'"Times New Roman", Times, "Liberation Serif", serif !important','background':'transparent !important'},
    'p, li, blockquote':{'font-size':'1em !important'},
    'pre, code':{'font-family':'"Times New Roman", Times, serif !important','font-size':'1em !important','white-space':'pre-wrap !important','color':'#111111 !important','background':'transparent !important'},
    'h1, h2, h3, h4, h5, h6':{'font-family':'"Times New Roman", Times, serif !important','color':'#111111 !important'},
    'img, svg':{'max-width':'100% !important','object-fit':'contain'},
    'a':{'color':'#274e75 !important'}
  };
}
