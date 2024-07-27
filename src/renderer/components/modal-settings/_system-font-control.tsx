import React, { FC } from 'react';
import { AppConfigKey } from '@app-context';
import { FormControlSelect } from '../forms';
import { useSystemFonts } from '../../hooks/use-system-fonts';
import { useAppConfig } from '../../hooks/use-app-config';

export const SystemFontControl: FC = () => {
  const fonts = useSystemFonts();
  const [fontFamily, setFontFamily] = useAppConfig(AppConfigKey.FontFamily);

  return (
    <div className="card-row system-font-control">
      <div className="option-name">
        <span>Font Family</span>
      </div>

      <div className="option-control">
        <div className="control-wrap">
          <FormControlSelect
            options={fonts}
            labelKey="label"
            valueKey="family"
            id="font-family-selector"
            value={fontFamily}
            onChange={setFontFamily}
          />
        </div>
      </div>
    </div>
  );
};