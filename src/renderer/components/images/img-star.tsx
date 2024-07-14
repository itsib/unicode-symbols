import React, { FC, memo } from 'react';

export interface IImgStar extends Omit<React.SVGProps<SVGSVGElement>, 'viewBox' | 'xmlns'> {
  active?: boolean
}

export const ImgStar = memo(function ImgBack({ active, ...props }: IImgStar) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24" {...props}>
      <path
        fill={active ? 'var(--img-star-fill-active, currentColor)' : 'var(--img-star-fill, none)'}
        stroke="var(--img-star-stroke, currentColor)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0"
      />
    </svg>
  );
});
