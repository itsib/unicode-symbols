import React, { useEffect, useRef, useState } from 'react';
import { FormControlBaseProps } from '@app-types';
import { FormControlOption } from '../../../types/form/form-control-option';
import { FormControlDropdown } from './_form-control-dropdown';

export interface IFormControlSelect<T extends number | string> extends FormControlBaseProps<T> {
  options: FormControlOption<T>[];
}

export function FormControlSelect<T extends number | string>(props: IFormControlSelect<T>) {
  const { id, name, label, onChange, value, validate, options } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  function onClick(event: React.MouseEvent<HTMLDivElement>) {
    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
    setRect(rect);
    setOpen(true);
  }

  function onChangeCallback(_value: T) {
    setError(validate?.(_value) || null);
    onChange?.(_value);
  }

  // Update input value
  useEffect(() => {
    const input = ref.current?.querySelector('input');
    if (!input) {
      return;
    }
    if (value == null) {
      input.value = '';
    } else {
      const selected = options.find(opt => opt.value === value);
      input.value = selected ? selected.label : '';
    }
  }, [value, options]);

  return (
    <div className="form-control form-control-select">
      {label ? <label htmlFor={id}>{label}</label> : null}

      <div className={`control ${error ? 'is-error' : ''}`} ref={ref} onClick={onClick}>
        <input id={id} name={name} readOnly/>

        <svg height="16px" viewBox="0 0 16 16" width="16px" xmlns="http://www.w3.org/2000/svg">
          <path d="M14,5l-6,6l-6,-6" stroke="currentColor" fill="transparent" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <FormControlDropdown value={value} options={options} open={open} rect={rect} onDismiss={() => setOpen(false)} onChange={onChangeCallback} />

      <div className="error">
        <span>{error}</span>
      </div>
    </div>
  );
}