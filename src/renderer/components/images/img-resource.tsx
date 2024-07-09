import React, { FC } from 'react';

export type IImgResource = React.ImgHTMLAttributes<HTMLImageElement>;

export const ImgResource: FC<IImgResource> = ({ src: _src, alt, ...props }) => {
  let src;
  if (window.location.href.includes('index.html')) {
    src = window.location.href.split('index.html')[0] + 'assets/' + _src;
  } else {
    src = `${window.location.origin}/src/assets/images/${_src}`;
  }

  return (
    <img src={src} alt={alt} {...props} />
  );
};
