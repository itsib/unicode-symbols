import React, { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { debounce } from '../../../utils/debounce';
import { FormControlBaseProps } from '@app-types';

export interface IFormControlInput extends FormControlBaseProps<string> {
  type: string;
  tabIndex?: number;
  placeholder?: string;
}

export const FormControlInput = forwardRef((props: IFormControlInput, ref: ForwardedRef<HTMLInputElement>) => {
  const { id, name, label, onChange, value, validate, type, tabIndex, debounce: debounceMs = 500, disabled, placeholder } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Update input value
  useEffect(() => {
    const input = document.getElementById(id) as HTMLInputElement;
    if (!input) {
      return;
    }
    input.value = value == null ? '' : value;
  }, [id]);

  // Watch input changes event
  useEffect(() => {
    const input = document.getElementById(id) as HTMLInputElement;
    if (!input) {
      return;
    }

    const update = debounce<string>(value => onChange?.(value), debounceMs);

    function onInput(event: InputEvent) {
      const value = (event.target as HTMLInputElement).value || '';

      setError(validate?.(value) || null);
      update(value);
    }

    input.addEventListener('input', onInput);
    return () => {
      input.removeEventListener('input', onInput);
    };
  }, [validate, debounceMs, id]);

  return (
    <div className="form-control form-control-input">
      {label ? <label htmlFor={id}>{label}</label> : null}

      <div className={`control ${error ? 'is-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
        <input id={id} tabIndex={tabIndex} placeholder={placeholder} name={name} type={type} ref={ref} />
      </div>

      <div className="error">
        <span>{error}</span>
      </div>
    </div>
  );
});
