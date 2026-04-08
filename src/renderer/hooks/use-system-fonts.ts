import { useEffect, useState } from 'react';
import { DEFAULT_FONT_FAMILY } from '../constants/common';

const FIRST = {
  label: `<span style="font-family: '${DEFAULT_FONT_FAMILY}'">${DEFAULT_FONT_FAMILY}</span>`,
  value: DEFAULT_FONT_FAMILY,
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

export function useSystemFonts(): { label: string; value: string }[] {
  const [fontFamilies, setFontFamilies] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    getFonts()
      .then(fonts => {
        const indexed: {[key: string]: { label: string; value: string }} = {
          [FIRST.value]: FIRST,
        };

        for (const font of fonts) {
          indexed[font.family] = {
            label: `<span style="font-family: '${font.family}'">${font.family}</span>`,
            value: font.family,
          }
        }

        Reflect.deleteProperty(indexed, FIRST.value)

        setFontFamilies([FIRST, ...Object.values(indexed)]);
      })
      .catch(error => {
        GET_FONTS = null;
        console.error(error);
      });
  }, []);

  return fontFamilies;
}
