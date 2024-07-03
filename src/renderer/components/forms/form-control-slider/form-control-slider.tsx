import React, { FC, useEffect, useRef } from 'react';
import { IFormControlBase } from '../types';
import { debounce } from '../../../utils/debounce';

export interface IFormControlSlider extends IFormControlBase<number> {
  min?: number;
  max?: number;
  step?: number;
  debounce?: number;
}

export const FormControlSlider: FC<IFormControlSlider> = props => {
  const { id, name, label, onChange, value, validate, min = 0, max = 100, step = 1, debounce: debounceMs = 500 } = props;
  const mainElementRef = useRef<HTMLDivElement | null>(null);
  const sliderElementRef = useRef<HTMLInputElement>();
  const previousValidValue = useRef(value as number);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const error = 0;

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
      mainElementRef.current?.style.setProperty('--value', value);
      update(Number(value));
    };
    const mouseupCallback = (event: Event) => {
      update(Number((event.target as HTMLInputElement).value ?? '0'));
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
    mainElementRef.current?.style.setProperty('--value', strValue);
  }, [value]);

  return (
    <div className="form-control-slider" ref={mainElementRef} style={{ '--min': min, '--max': max } as React.CSSProperties}>
      {label ? <label htmlFor={id}>{label}</label> : null}

      <div className={`control ${error ? 'is-error' : ''}`}>
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
