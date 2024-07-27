import React, { useEffect, useRef, useState } from 'react';
import { FormControlBaseProps } from '@app-types';
import { FormControlDropdown } from './_form-control-dropdown';

export interface IFormControlSelect<T extends number | string> extends FormControlBaseProps<T> {
  options: Record<string, any>[];
  valueKey?: string;
  labelKey?: string;
}

export function FormControlSelect<T extends number | string>(props: IFormControlSelect<T>) {
  const { id, name, label, onChange, value, validate, options, valueKey = 'value', labelKey = 'label' } = props;
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
      const selected = options.find(opt => opt[valueKey] === value);
      if (!selected) {
        input.value = '';
      } else {
        const span = document.createElement('span');
        span.innerHTML = selected.label;
        input.value = span.innerText;
      }
    }
  }, [value, options, valueKey]);

  return (
    <div className="form-control form-control-select">
      {label ? <label htmlFor={id}>{label}</label> : null}

      <div className={`control ${error ? 'is-error' : ''}`} ref={ref} onClick={onClick}>
        <input id={id} name={name} readOnly/>

        <svg className="icon" height="16px" viewBox="0 0 16 16" width="16px" xmlns="http://www.w3.org/2000/svg">
          <path d="M14,5l-6,6l-6,-6" stroke="currentColor" fill="transparent" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <FormControlDropdown
        id={id}
        value={value}
        options={options}
        labelKey={labelKey}
        valueKey={valueKey}
        open={open}
        rect={rect}
        onDismiss={() => setOpen(false)}
        onChange={onChangeCallback}
      />

      <div className="error">
        <span>{error}</span>
      </div>
    </div>
  );
}