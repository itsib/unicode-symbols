import React, { memo } from 'react';

export type IImgClose = Omit<React.SVGProps<SVGSVGElement>, 'viewBox' | 'xmlns'>;

export const ImgClose = memo(function ImgClose(props: IImgClose) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M3.793 4.5l3.5 3.5-3.5 3.5.707.707 3.5-3.5 3.5 3.5.707-.707-3.5-3.5 3.5-3.5-.707-.707-3.5 3.5-3.5-3.5z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
});
