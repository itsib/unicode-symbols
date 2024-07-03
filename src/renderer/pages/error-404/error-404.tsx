import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import BrokenIcon from '../../../assets/images/broken.svg?react';

export const Error404: FC = () => {
  return (
    <main className="error-404-page">
      <div className="image">
        <BrokenIcon />
      </div>
      <div className="message">
        <span>I think you've ruined everything.</span>
      </div>

      <Link to={{ pathname: '/' }}>
        <button type="button" className="btn btn-primary">
          <span>Go Back</span>
        </button>
      </Link>
    </main>
  );
};
