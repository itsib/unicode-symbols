import React, { FC } from 'react';
import { SymbolSkinColor } from '@app-types';

export interface ISkinColorPicker {
  disabled?: boolean;
  value?: SymbolSkinColor;
  onChange?: (value: SymbolSkinColor) => void;
}

export const SkinColorPicker: FC<ISkinColorPicker> = ({ value = 0, onChange, disabled }) => {
  return (
    <div className="skin-color-picker">
      <button type="button" className={`btn btn-skin btn-skin-0 ${value === 0 ? 'active' : ''}`} onClick={() => onChange?.(0)} disabled={disabled} />
      <button type="button" className={`btn btn-skin btn-skin-1 ${value === 1 ? 'active' : ''}`} onClick={() => onChange?.(1)} disabled={disabled} />
      <button type="button" className={`btn btn-skin btn-skin-2 ${value === 2 ? 'active' : ''}`} onClick={() => onChange?.(2)} disabled={disabled} />
      <button type="button" className={`btn btn-skin btn-skin-3 ${value === 3 ? 'active' : ''}`} onClick={() => onChange?.(3)} disabled={disabled} />
      <button type="button" className={`btn btn-skin btn-skin-4 ${value === 4 ? 'active' : ''}`} onClick={() => onChange?.(4)} disabled={disabled} />
      <button type="button" className={`btn btn-skin btn-skin-5 ${value === 5 ? 'active' : ''}`} onClick={() => onChange?.(5)} disabled={disabled} />
    </div>
  );
};
