import React, { FC } from 'react';
import BackIcon from '../../svg/back.svg?react';
import './settings.css';
import { Link } from 'react-router-dom';

export const SettingsPage: FC = () => {
  return (
    <div className="settings-page">
      <div className="container">
        <Link to="/" className="back-link">
          <BackIcon />
          <span>Settings</span>
        </Link>

        <div className="card">

        </div>
      </div>
    </div>
  );
};
