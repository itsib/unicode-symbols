import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

interface ItemData {
  id: string;
  options: Record<string, any>[];
  valueKey: string;
  labelKey: string;
  value: number | string;
  onClickItemBtn(_value: number | string): void
}

export interface IFormControlDropdown<T extends number | string> {
  id: string;
  open?: boolean;
  rect?: DOMRect;
  value?: T;
  valueKey?: string;
  labelKey?: string;
  options: Record<string, any> [];
  onChange?: (value: T) => void;
  onDismiss?: () => void;
}

export function FormControlDropdown<T extends number | string>(props: IFormControlDropdown<T>) {
  const { id, value, valueKey = 'value', labelKey = 'label', options, rect, open, onChange, onDismiss } = props;
  const ref = useRef<FixedSizeList>();
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

  const itemDataRef = useRef<ItemData>({
    id,
    options,
    valueKey,
    labelKey,
    value,
    onClickItemBtn(_value: string | number) {
      onDismiss?.();
      onChange?.(_value as T);
    }
  });

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
        const index = options.findIndex(opt => opt[valueKey] === value);
        ref.current.scrollToItem(index, 'center');
      }, 20);

      return () => {
        clearTimeout(timeout);
      }
    }

  }, [open, value, valueKey, options]);

  useEffect(() => {
    itemDataRef.current.id = id;
    itemDataRef.current.options = options;
    itemDataRef.current.valueKey = valueKey;
    itemDataRef.current.labelKey = labelKey;
    itemDataRef.current.value = value;
  }, [options, valueKey, labelKey, value, id]);

  return (process || open) && rect && points ? createPortal(
    <div
      className="form-control-dropdown"
      style={{
        left: `${points.left}px`,
        top: `${points.top}px`,
      }}
    >
      <div className="select-dropdown-overlay" aria-label="dropdown overlay" onClick={onClickOverlay} />
      <div className={`select-dropdown-menu ${dropdownClass}`} aria-label="dropdown">
        <FixedSizeList
          height={points.height}
          itemCount={options.length}
          itemSize={points.itemHeight}
          width={points.width}
          itemData={itemDataRef.current}
          ref={ref}
        >
          {Option}
        </FixedSizeList>
      </div>

    </div>,
    document.body,
  ) : null;
}

function Option(props: ListChildComponentProps<ItemData>) {
  const { data, style, index } = props;
  const option = data.options[index];
  const label = option[data.labelKey];
  const value = option[data.valueKey];

  const id = data.id;
  const active = data.value === value;

  return (
    <button type="button" style={style} id={active ? `${id}-active` : null}
            className={`btn btn-option ${active ? 'active' : ''}`} value={value}
            onClick={() => data.onClickItemBtn(value)}>
      <span dangerouslySetInnerHTML={{ __html: label }}/>

      {active ? (
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="active-check">
          <path d="M13.969 2.969L6.5 10.438l-4.469-4.47L.97 7.032l5.531 5.53 8.531-8.53z" fill="currentColor"/>
        </svg>
      ) : null}
    </button>
  );
}