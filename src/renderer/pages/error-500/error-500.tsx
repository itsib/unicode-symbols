import React, { FC } from 'react';
import { useRouteError } from 'react-router-dom';
import BrokenIcon from '../../../assets/images/broken.svg';

export const Error500: FC = () => {
  const error = useRouteError();

  return (
    <main className="error-500-page">
      <div className="image">
        <img src={BrokenIcon} alt="Broken" />
      </div>
      <div className="message">
        <span>I think you've ruined everything.</span>
      </div>
      <div className="sub-message">
        <span>{(error as any)?.message ?? ''}</span>
      </div>
    </main>
  );
};
