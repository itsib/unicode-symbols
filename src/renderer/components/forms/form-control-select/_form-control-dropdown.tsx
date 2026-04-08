import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { List, RowComponentProps, useListRef } from 'react-window';
import './_form-control-dropdown.css'

interface ItemData {
  options: Record<string, any>[];
  value: number | string;
  onSelect(_value: string | number): void
}

export interface IFormControlDropdown<T extends number | string> {
  id: string;
  open?: boolean;
  rect?: DOMRect;
  options: { label?: string; value: string } [];
  value?: T;
  onChange?: (value: T) => void;
  onDismiss?: () => void;
}

export function FormControlDropdown<T extends number | string>(props: IFormControlDropdown<T>) {
  const { value, options, rect, open, onChange, onDismiss } = props;
  const ref = useListRef(null);
  const [process, setProcess] = useState(false);
  const [dropdownClass, setDropdownClass] = useState<string>('animation-from');

  const points = useMemo(() => {
    if (!rect) {
      return null;
    }
    const padding = 10;
    const centerX = rect.left + (rect.width / 2);
    const centerY = rect.top + (rect.height / 2);
    const itemHeight = 38;
    const fullHeight = options.length * itemHeight;
    const maxHeight = (window.innerHeight - centerY - 20) * 2;

    const width = Math.max(rect.width, 100) + padding;
    const height = Math.min(maxHeight, fullHeight, 460);
    const left = centerX - (width / 2);
    const top = centerY - (height / 2);

    return { width, height, left, top, itemHeight, padding }
  }, [rect, options.length])

  function onClickOverlay(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    onDismiss?.();
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
    if (open) {
      const timeout = setTimeout(() => {
        const index = options.findIndex(opt => opt.value === value);
        ref.current.scrollToRow({ index, align: 'center' });
      }, 20);

      return () => {
        clearTimeout(timeout);
      }
    }

  }, [open, value, options]);

  return (process || open) && rect && points ? createPortal(
    <div
      className="form-control-dropdown"
      style={{
        left: `${points.left}px`,
        top: `${points.top}px`,
      }}
    >
      <div className="select-dropdown-overlay" aria-label="dropdown overlay" onClick={onClickOverlay} />
      <div
        className={`select-dropdown-menu 
        ${dropdownClass}`}
        aria-label="dropdown"
        style={{
          width: `${points.width}px`,
          height: `${points.height}px`,
          maxHeight: `${points.height}px`,
        }}
      >
        <List
          rowComponent={Option}
          rowProps={{
            options,
            value,
            onSelect(_value: string | number) {
              onDismiss?.();
              onChange?.(_value as T);
            }
          }}
          rowCount={options.length}
          rowHeight={points.itemHeight}
          listRef={ref}
        />
      </div>
    </div>,
    document.body,
  ) : null;
}

function Option(props: RowComponentProps<ItemData>) {
  const { options, style, index, onSelect, value, ariaAttributes } = props;
  const option = options[index];

  const active = option.value === value;

  return (
    <button
      type="button"
      style={style} id={active ? `${index}-active` : null}
      className={`btn btn-option ${active ? 'active' : ''}`}
      value={value}
      onClick={() => onSelect(options[index]?.value)}
      {...ariaAttributes}
    >
      <span dangerouslySetInnerHTML={{ __html: option.label || option.value }}/>

      {active ? (
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="active-check">
          <path d="M13.969 2.969L6.5 10.438l-4.469-4.47L.97 7.032l5.531 5.53 8.531-8.53z" fill="currentColor"/>
        </svg>
      ) : null}
    </button>
  );
}
