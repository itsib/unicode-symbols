import { useEffect, useState } from 'react';
import { FormControlOption } from '@app-types';
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

export function useSystemFonts(): FormControlOption<string>[] {
  const [fontFamilies, setFontFamilies] = useState<FormControlOption<string>[]>([]);

  useEffect(() => {
    queryLocalFonts()
      .then(fonts => {
        const indexed: Record<string, FormControlOption<string>> = {
          [FIRST.value]: FIRST,
        };

        for (let i = 0; i < fonts.length; i++) {
          indexed[fonts[i].family] = {
            label: `<span style="font-family: '${fonts[i].family}'; line-height: 0">${fonts[i].family}</span>`,
            value: fonts[i].family,
          };
        }

        Reflect.deleteProperty(indexed, FIRST.value);

        setFontFamilies([FIRST, ...Object.values(indexed)]);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return fontFamilies;
}