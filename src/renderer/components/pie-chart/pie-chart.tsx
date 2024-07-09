import React, { FC, SVGProps, useMemo } from 'react';

export interface IPieChart extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height' | 'viewBox' | 'fill' | 'xmlns'> {
  size?: number;
  percent?: number;
}

export const PieChart: FC<IPieChart> = ({ size = 58, percent = 0, ...props }) => {
  const { radius, strokeDashoffset, strokeDasharray } = useMemo(() => {
    const angle = Math.max(percent * (360 / 100), 2);
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = (1 / 4) * circumference;
    const strokeDasharrayFill = (angle / 360) * circumference;

    return {
      radius,
      strokeDashoffset,
      strokeDasharray: [strokeDasharrayFill, circumference - strokeDasharrayFill],
    };
  }, [percent]);

  return (
    <svg width={size} height={size} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle
        cx="25"
        cy="25"
        r={radius}
        fill="none"
        strokeWidth="8"
        style={{ 'stroke': 'var(--pie-chart-fill-bg)' }}
      />
      <circle
        cx="25"
        cy="25"
        r={radius}
        fill="none"
        strokeDasharray={strokeDasharray as any}
        strokeDashoffset={strokeDashoffset}
        strokeWidth="8"
        style={{ 'stroke': 'var(--pie-chart-fill-active)' }}
      />
      <text fill="rgb(var(--text-primary))" y="25px" x="25px" alignmentBaseline="middle" textAnchor="middle" fontSize="10px">{+percent.toFixed(2)}%</text>
    </svg>
  );
};
