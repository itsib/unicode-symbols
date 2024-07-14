import React, { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FormControlSlider } from '../../components/forms';
import { StorageUsage } from '@app-types';
import { PieChart } from '../../components/pie-chart/pie-chart';
import { useAppConfig } from '../../hooks/use-app-config';
import { AppConfigKey } from '@app-context';
import { ImgBack } from '../../components/images/img-back';

export const SettingsPage: FC = () => {
  const [iconSize, setIconSize] = useAppConfig(AppConfigKey.IconSize);
  const [storage, setStorage] = useState<StorageUsage>();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined = undefined;
    const refresh = async () => {
      const estimate = await navigator.storage.estimate();

      const usage = Math.round(estimate.usage / 10000) / 100;
      const quota = Math.round(estimate.quota / 10000) / 100;
      const percent = Math.round((usage / quota) * 100000) / 1000;

      setStorage({ usage, quota, percent });

      timer = setTimeout(refresh, 10_000);
    }
    refresh();

    return () => {
      if (timer != null) {
        clearTimeout(timer);
      }
    }
  }, []);

  return (
    <div className="settings-page">
      <div className="container">
        <Link to="/" className="back-link">
          <ImgBack className="icon" />
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
          <div className="card-row storage-usage">
            <div className="option-name">
              <span>Storage Usage</span>
            </div>

            {storage ? (
              <div className="option-control">
                <div className="detail-info">
                  <div>
                    <span>Usage:&nbsp;</span>
                    <span className="amount">{storage.usage}</span>
                    <span>&nbsp;MB</span>
                  </div>
                  <div>
                    <span>Quota:&nbsp;</span>
                    <span className="amount">{storage.quota}</span>
                    <span>&nbsp;MB</span>
                  </div>
                </div>

                <div className="pie-chard">
                  <PieChart percent={storage.percent} size={50} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
