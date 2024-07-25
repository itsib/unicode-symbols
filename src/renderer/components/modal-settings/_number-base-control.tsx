import React, { FC } from 'react';
import { useAppConfig } from '../../hooks/use-app-config';
import { AppConfigKey } from '@app-context';
import { FormControlOption } from '@app-types';
import { FormControlSelect } from '../forms';

const NUMBERS_BASE_OPTIONS: FormControlOption<number>[] = [
  {
    label: 'Decimals',
    value: 10,
  },
  {
    label: 'Hexadecimal',
    value: 16,
  }
];

export const NumberBaseControl: FC = () => {
  const [numberBase, setNumberBase] = useAppConfig(AppConfigKey.NumberBase);

  return (
    <div className="card-row number-base-control">
      <div className="option-name">
        <span>Numbers Base</span>
      </div>

      <div className="option-control">
        <div className="control-wrap">
          <FormControlSelect
            options={NUMBERS_BASE_OPTIONS}
            id="nimbers-base-selector"
            value={numberBase}
            onChange={setNumberBase}
          />
        </div>
      </div>
    </div>
  );
};
