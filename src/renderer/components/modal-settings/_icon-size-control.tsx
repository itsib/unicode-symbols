import React, { FC } from 'react';
import { useAppConfig } from '../../hooks/use-app-config';
import { AppConfigKey } from '@app-context';
import { FormControlSlider } from '../forms';

export const IconSizeControl: FC = () => {
  const [iconSize, setIconSize] = useAppConfig(AppConfigKey.IconSize);

  return (
    <div className="card-row icon-size-control">
      <div className="option-name">
        <span>Icon Size</span>
      </div>

      <div className="option-control">
        <div className="inner-value">{iconSize}px</div>

        <div className="inner-control">
          <FormControlSlider
            id="font-size-control"
            value={iconSize}
            min={26}
            step={4}
            max={50}
            debounce={1}
            onChange={setIconSize}
          />
        </div>
      </div>
    </div>
  );
};