import React, { FC, useEffect, useRef, useState } from 'react';
import { debounce } from '../../../utils/debounce';

export interface IFormControlHex {
  id: string;
  name?: string;
  label?: string;
  value?: number;
  onChange?: (value?: number) => void;
  validate?: (value?: number) => string | null;
}

export const FormControlHex: FC<IFormControlHex> = ({ id, name, label, onChange, value, validate }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    input.value = value != null ? value.toString(16) : '';
  }, [value]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    const update = debounce<number | undefined>(value => onChange?.(value), 1000);

    function onInput(event: InputEvent) {
      const input = event.target as HTMLInputElement;
      const value = parseInt(input.value, 16);
      const normalized = !isNaN(value) && isFinite(value) ? value : undefined;

      setError(validate?.(normalized) || null);
      update(normalized);
    }

    function onBeforeInput(event: InputEvent) {
      if (event.inputType === 'insertText') {
        if (event.data && !/^[a-fA-F0-9]+$/.test(event.data)) {
          event.preventDefault();
        }
      }
    }

    input.addEventListener('beforeinput', onBeforeInput);
    input.addEventListener('input', onInput);
    return () => {
      input.removeEventListener('beforeinput', onBeforeInput);
      input.removeEventListener('input', onInput);
    };
  }, [validate]);

  return (
    <div className="form-control-hex" onClick={() => inputRef.current?.setSelectionRange(0, 100)}>
      {label ? <label htmlFor={id}>{label}</label> : null}

      <div className={`control ${error ? 'is-error' : ''}`}>
        <div className="prefix">0x</div>
        <input id={id} name={name} spellCheck="false" type="text" ref={inputRef} />
      </div>

      <div className="error">
        <span>{error}</span>
      </div>
    </div>
  );
};
