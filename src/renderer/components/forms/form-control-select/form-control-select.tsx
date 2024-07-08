import React, { FC, useEffect, useRef, useState } from 'react';
import { debounce } from '../../../utils/debounce';
import { FormControlBaseProps } from '@app-types';
import { FormControlOption } from '../../../types/form/form-control-option';
import { useOnClickOutside } from '../../../hooks/use-on-click-outside';
import { createPortal } from 'react-dom';

export interface IFormControlSelect<T extends number | string> extends FormControlBaseProps<T> {
  options: FormControlOption<T>[];
}

export function FormControlSelect<T extends number | string>(props: IFormControlSelect<T>) {
  const { id, name, label, onChange, value, validate, debounce: debounceMs = 500, options } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useOnClickOutside(ref, () => setOpen(false));

  function onClick(event: React.MouseEvent<HTMLDivElement>) {
    const rect = (event.target as HTMLDivElement).getBoundingClientRect();
    setRect(rect);
    setOpen(true);
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
          <path d="M14,5l-6,6l-6,-6" stroke="currentColor" fill="transparent" strokeLinecap="round"
                strokeLinejoin="round"/>
        </svg>

        <Dropdown options={options} open={open} />
      </div>

      <div className="error">
        <span>{error}</span>
      </div>
    </div>
  );
}

interface IDropdown<T extends number | string> {
  open?: boolean;
  rect?: DOMRect;
  options: FormControlOption<T>[];
}

function Dropdown<T extends number | string>({ options, rect, open }: IDropdown<T>) {
  const [animated, setAnimated] = useState(false);

  return animated || open ? createPortal(
    <ul className="select-dropdown">
      {options.map(option => <Option<T> key={option.value} {...option} />)}
    </ul>,
    document.body,
  ) : null;
}


function Option<T extends number | string>({ value, label, active }: FormControlOption<T> & { active?: boolean }) {
  return (
    <li className="option">
      <button type="button" className={`btn btn-option ${active ? 'active' : ''}`} value={value}>
        <span>{label}</span>
      </button>
    </li>
  );
}