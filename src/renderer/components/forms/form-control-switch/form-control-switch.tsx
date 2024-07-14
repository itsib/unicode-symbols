import React, { FC, useState } from 'react';
import { FormControlBaseProps } from '@app-types';

export interface IFormControlSwitch extends FormControlBaseProps<boolean> {

}

export const FormControlSwitch: FC<IFormControlSwitch> = (props) => {
  const { id, name, label, onChange, value, validate, debounce: debounceMs = 500, disabled } = props;
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="form-control form-control-switch">
      {label ? <label htmlFor={id}>{label}</label> : null}

      <div className="switch-wrap">
        <input
          id={id}
          type="checkbox"
          role="switch"
          name={name}
          className="hidden-checkbox"
          checked={value}
          disabled={disabled}
          onChange={e => onChange?.((e.target as HTMLInputElement).checked)}
        />
        <div className="switch">
          <span className="switch-thumb"/>
        </div>
      </div>

      <div className="error">
        <span>{error}</span>
      </div>
    </div>
  );
};