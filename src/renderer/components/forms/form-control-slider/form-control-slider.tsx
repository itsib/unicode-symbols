import React, { FC, useEffect, useRef, useState } from 'react';
import { debounce } from '../../../utils/debounce';
import { FormControlBaseProps } from '@app-types';

export interface IFormControlSlider extends FormControlBaseProps<number> {
  min?: number;
  max?: number;
  step?: number;
}

export const FormControlSlider: FC<IFormControlSlider> = props => {
  const { id, name, label, onChange, value, validate, min = 0, max = 100, step = 1, debounce: debounceMs = 500, disabled } = props;
  const [error, setError] = useState<string | null>(null);
  const mainElementRef = useRef<HTMLDivElement | null>(null);
  const sliderElementRef = useRef<HTMLInputElement>();
  const previousValidValue = useRef(value as number);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Handle slider change
  useEffect(() => {
    const element = sliderElementRef.current;
    if (!element) {
      return;
    }

    const update = debounce<number>(value => {
      previousValidValue.current = value;
      onChangeRef.current?.(value);
    }, debounceMs);

    const inputCallback = (event: Event) => {
      const value = (event.target as HTMLInputElement).value ?? '0';
      mainElementRef.current?.style.setProperty('--form-control-slider-value', value);

      const normalized = Number(value);
      setError(validate?.(normalized) || null);
      update(normalized);
    };

    const mouseupCallback = (event: Event) => {
      const normalized = Number((event.target as HTMLInputElement).value ?? '0');

      setError(validate?.(normalized) || null);
      update(normalized);
    };

    element.addEventListener('input', inputCallback);
    element.addEventListener('mouseup', mouseupCallback);
    return () => {
      element.removeEventListener('input', inputCallback);
      element.removeEventListener('mouseup', mouseupCallback);
    };
  }, [debounceMs]);

  // Update inputs when value change
  useEffect(() => {
    const element = sliderElementRef.current;
    if (!element) {
      return;
    }
    const strValue = value?.toString() ?? '';
    element.value = strValue;
    mainElementRef.current?.style.setProperty('--form-control-slider-value', strValue);
  }, [value]);

  return (
    <div className="form-control form-control-slider" ref={mainElementRef} style={{ '--form-control-slider-min': min, '--form-control-slider-max': max } as React.CSSProperties}>
      {label ? <label htmlFor={id}>{label}</label> : null}

      <div className={`slider-wrap ${error ? 'is-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
        <input
          id={id}
          type="range"
          name={name}
          className="slider"
          min={min}
          max={max}
          step={step}
          ref={sliderElementRef as any}
        />
      </div>

      <div className="error">
        <span>{error}</span>
      </div>
    </div>
  );
};
