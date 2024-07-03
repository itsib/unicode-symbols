import React, { FC, ReactNode } from 'react';

export interface IBtnCopy {
  text?: string;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  children?: ReactNode | undefined;
  className?: string;
}

export const BtnCopy: FC<IBtnCopy> = ({ text, tooltip = 'Copy to clipboard', tooltipPosition = 'top', children, className }) => {
  return (
    <button
      type="button"
      className={className}
      aria-label={tooltip}
      data-tooltip-pos={tooltipPosition}
      onClick={event => {
        event.stopPropagation();
        if (text) {
          window.appAPI.copyText(text);
          const button = event.currentTarget as HTMLButtonElement;
          button.setAttribute('aria-label', 'Copied  ✔');
        }
      }}
      onMouseLeave={event => {
        const button = event.currentTarget as HTMLButtonElement;
        setTimeout(() => button.setAttribute('aria-label', tooltip), 120);
      }}
    >
      {children}
    </button>
  );
};
