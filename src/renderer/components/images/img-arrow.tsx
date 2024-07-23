import React, { memo } from 'react';

export interface IImgArrow extends Omit<React.SVGProps<SVGSVGElement>, 'viewBox' | 'xmlns'> {
  direction?: 'left' | 'right';
}

export const ImgArrow = memo(function ImgBack({ direction = 'left', ...props }: IImgArrow) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
      {direction === 'left' ? (
        <path
          fill="currentColor"
          d="M8.293 12.707a1 1 0 0 1 0-1.414l5.657-5.657a1 1 0 1 1 1.414 1.414L10.414 12l4.95 4.95a1 1 0 0 1-1.414 1.414z"
        />
      ) : (
        <path
          fill="currentColor"
          d="M15.707 11.293a1 1 0 0 1 0 1.414l-5.657 5.657a1 1 0 1 1-1.414-1.414l4.95-4.95l-4.95-4.95a1 1 0 0 1 1.414-1.414z"
        />
      )}
    </svg>
  );
});