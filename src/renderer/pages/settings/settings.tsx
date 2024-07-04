import React, { FC } from 'react';
import BackIcon from '../../../assets/images/back.svg';
import { Link } from 'react-router-dom';
import { FormControlSlider } from '../../components/forms';
import { useIconSize } from '../../hooks/use-icon-size';

export const SettingsPage: FC = () => {
  const [iconSize, setIconSize] = useIconSize();

  return (
    <div className="settings-page">
      <div className="container">
        <Link to="/" className="back-link">
          <img src={BackIcon} alt="Back icon" className="icon" />
          <span>Settings</span>
        </Link>

        <div className="card">
          <div className="card-row icon-size-control">
            <div className="option-name">
              <span>Icon Size</span>
            </div>

            <div className="option-control">
              <div className="inner-value">{iconSize}px</div>

              <div className="inner-control">
                <FormControlSlider
                  id="font-size-control"
                  value={iconSize}
                  min={26}
                  step={4}
                  max={50}
                  debounce={1}
                  onChange={setIconSize}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
