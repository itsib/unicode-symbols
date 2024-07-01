import React, { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { FormControlHex } from '../forms/form-control-hex/form-control-hex';
import { SymbolsRange } from '../../types';

export interface IFormCreateRange {
  onChange?: (range: SymbolsRange) => void;
  onGoBack?: () => void;
}

export const FormCreateRange: FC<IFormCreateRange> = ({ onChange, onGoBack }) => {
  const [begin, setBegin] = useState<number>(0);
  const [end, setEnd] = useState<number>(65535);

  const validateBegin = useCallback((value: number | undefined) => {
    if (value == null) {
      return 'Field is required';
    }
    if (end != null && value >= end) {
      return 'Should be less than the end of range';
    }
    return null;
  }, [end]);

  const validateEnd = useCallback((value: number | undefined) => {
    if (value == null) {
      return 'Field is required';
    }
    if (begin != null && value <= begin) {
      return 'Should be less greater the end of range';
    }
    return null;
  }, [begin]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (begin == null || end == null || begin >= end) {
      return;
    }

    const range = { begin, end };
    localStorage.setItem('symbols-range', JSON.stringify(range));
    onChange?.(range);
  }

  useEffect(() => {
    const rangeSrc = localStorage.getItem('symbols-range');
    const range = rangeSrc ? JSON.parse(rangeSrc) : { begin: 0, end: 65535 };

    setBegin(range.begin);
    setEnd(range.end);
    onChange?.(range);
  }, []);

  return (
    <div className="form-create-range">
      <h4 className="caption">
        <span>Select a range of characters</span>
      </h4>

      <form className="create-form" onSubmit={onSubmit}>
        <div className="form-control">
          <FormControlHex
            id="range-begin-input"
            name="begin"
            label="Code of the range start"
            value={begin}
            onChange={setBegin}
            validate={validateBegin}
          />
        </div>

        <div className="form-control">
          <FormControlHex
            id="range-begin-input"
            name="end"
            label="Code of the range end"
            value={end}
            onChange={setEnd}
            validate={validateEnd}
          />
        </div>

        <div className="button-block">
          <button type="submit" className="btn btn-primary">
            <span>Generate Range</span>
          </button>

          <button type="button" className="btn btn-secondary" onClick={onGoBack}>
            <span>Go Back</span>
          </button>
        </div>
      </form>
    </div>
  );
};
