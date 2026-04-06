import React, { type FC } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import animation from '../../../assets/animations/not-found.json';
import './nothing-found.css'

export const NothingFound: FC = () => {


  return (
    <div className="nothing-found">
      <DotLottieReact className="animation" data={animation} loop={false} autoplay />

      <div className="text">
        <span>Nothing Found</span>
      </div>
    </div>
  )
}
