import { isEbookFont, type EbookFont } from './ebookAppearance';

export type EbookPreferences = {fontSize:number;fontFamily?:EbookFont;cfi?:string};
export function parseEbookPreferences(value: string | null): EbookPreferences | undefined {
  if(!value)return;
  try {
    const data=JSON.parse(value);
    if(typeof data.fontSize !== 'number'||!Number.isFinite(data.fontSize))return;
    return {
      fontSize: Math.max(16, Math.min(32, Math.round(data.fontSize))),
      ...(isEbookFont(data.fontFamily) ? {fontFamily: data.fontFamily} : {}),
      cfi: typeof data.cfi === 'string' && data.cfi.startsWith('epubcfi(') ? data.cfi : undefined,
    };
  } catch {return;}
}
export const ebookPreferenceKey = (id:string,version:string) => `acuity.ebook.v1.${id}.${version}`;
