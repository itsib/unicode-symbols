import React, { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StorageUsage } from '@app-types';
import { PieChart } from '../../components/pie-chart/pie-chart';
import { ImgBack } from '../../components/images/img-back';

export const SettingsPage: FC = () => {
  const [storage, setStorage] = useState<StorageUsage>();

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
        <div className="caption">
          <Link to="/" className="back-link">
            <ImgBack className="icon" />
            <span>Back</span>
          </Link>

          <div className="header">Settings</div>
        </div>

        <div className="card">
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
