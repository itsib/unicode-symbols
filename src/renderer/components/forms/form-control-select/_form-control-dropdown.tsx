import { FormControlOption } from '@app-types';
import React, { CSSProperties, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLog } from '../../../hooks/use-log';

export interface IFormControlDropdown<T extends number | string> {
  id: string;
  open?: boolean;
  rect?: DOMRect;
  value?: T;
  options: FormControlOption<T>[];
  onChange?: (value: T) => void;
  onDismiss?: () => void;
}

export function FormControlDropdown<T extends number | string>(props: IFormControlDropdown<T>) {
  const { id, value, options, rect, open, onChange, onDismiss } = props;
  const [process, setProcess] = useState(false);
  const [dropdownClass, setDropdownClass] = useState<string>('animation-from');

  const ch = rect ? (rect.left + (rect.width / 2)) : 0;
  const cv = rect ? (rect.top + (rect.height / 2)) : 0;
  const hw = rect ? ((rect.width / 2) + Math.min(rect.left, 10)) : 0; // Half width
  const h = Math.min(window.innerHeight - cv, 460);

  useLog({ h });

  function onClickOverlay(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    onDismiss?.();
  }

  function onClickItemBtn(_value: T) {
    onDismiss?.();
    onChange?.(_value);
  }

  useEffect(() => {
    setProcess(true);
    if (open) {
      setTimeout(() => {
        setDropdownClass('');

      }, 10);
    } else {
      setTimeout(() => setDropdownClass('animation-out'), 10);

      setTimeout(() => {
        setDropdownClass('animation-from');
        setProcess(false);
      }, 300);
    }
  }, [open]);

  useEffect(() => {
    if (process || open) {
      const timeout = setTimeout(() => {
        const option = document.getElementById(`${id}-active`);
        option.scrollIntoView({ block: 'start' });
        option.parentElement.parentElement.parentElement.scrollBy(0, -10)
      }, 20);

      return () => {
        clearTimeout(timeout);
      }
    }

  }, [process, open, id]);

  return process || open ? createPortal(
    <div
      className="form-control-dropdown"
      style={{
        '--form-control-select-h': `${Math.round(h)}px`,
        '--form-control-select-hw': `${Math.round(hw)}px`,
        '--form-control-select-ch': `${Math.round(ch)}px`,
        '--form-control-select-cv': `${Math.round(cv)}px`,
      } as CSSProperties}
    >
      <div className="select-dropdown-overlay" aria-label="dropdown overlay" onClick={onClickOverlay} />
      <div className={`select-dropdown-menu ${dropdownClass}`} aria-label="dropdown">
        <ul className="menu-items">
          {options.map(option => <Option<T> key={option.value} id={id} onClick={onClickItemBtn} active={value === option.value} {...option} />)}
        </ul>
      </div>

    </div>,
    document.body,
  ) : null;
}

function Option<T extends number | string>(props: FormControlOption<T> & { id: string; active?: boolean, onClick: (value: T) => void }) {
  const { id, value, label, active, onClick } = props;
  return (
    <li className="option">
      <button type="button" id={active ? `${id}-active` : null} className={`btn btn-option ${active ? 'active' : ''}`} value={value} onClick={() => onClick(value)}>
        <span>{label}</span>

        {active ? (
          <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="active-check">
            <path d="M13.969 2.969L6.5 10.438l-4.469-4.47L.97 7.032l5.531 5.53 8.531-8.53z" fill="currentColor" />
          </svg>
        ) : null}
      </button>
    </li>
  );
}