import { useEffect, useState } from 'react';
import { FormControlOption } from '@app-types';
import { DEFAULT_FONT_FAMILY } from '../constants/common';

const FIRST = { label: DEFAULT_FONT_FAMILY, value: DEFAULT_FONT_FAMILY };

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
          [FIRST.value]: { label: 'Roboto', value: 'Roboto' }
        };

        for (let i = 0; i < fonts.length; i++) {
          indexed[fonts[i].family] = { label: fonts[i].family, value: fonts[i].family };
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