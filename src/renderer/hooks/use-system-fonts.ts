import { useEffect, useState } from 'react';
import { DEFAULT_FONT_FAMILY } from '../constants/common';

const FIRST = {
  label: `<span style="font-family: '${DEFAULT_FONT_FAMILY}'">${DEFAULT_FONT_FAMILY}</span>`,
  family: DEFAULT_FONT_FAMILY,
};

declare global {
  interface FontData {
    postscriptName: string;
    fullName: string;
    family: string;
    style: string;
  }

  function queryLocalFonts(): Promise<FontData[]>;
}

let GET_FONTS: Promise<FontData[]> | null = null;

function getFonts(): Promise<FontData[]> {
  if (!GET_FONTS) {
    GET_FONTS = queryLocalFonts();
  }
  return GET_FONTS;
}

export function useSystemFonts(): { label: string; family: string }[] {
  const [fontFamilies, setFontFamilies] = useState<{ label: string; family: string }[]>([]);

  useEffect(() => {
    getFonts()
      .then(fonts => {
        const indexed: {[key: string]: { label: string; family: string }} = {
          [FIRST.family]: FIRST,
        };

        for (const font of fonts) {
          indexed[font.family] = {
            label: `<span style="font-family: '${font.family}'">${font.family}</span>`,
            family: font.family,
          }
        }

        Reflect.deleteProperty(indexed, FIRST.family)

        setFontFamilies([FIRST, ...Object.values(indexed)]);
      })
      .catch(error => {
        GET_FONTS = null;
        console.error(error);
      });
  }, []);

  return fontFamilies;
}