import React, { FC } from 'react';
import Modal, { ModalProps } from '../modal/modal';
import { ImgClose } from '../images/img-close';
import { NumberBaseControl } from './_number-base-control';
import { IconSizeControl } from './_icon-size-control';
import { SystemFontControl } from './_system-font-control';

export interface IModalSettings extends ModalProps {

}

export const ModalSettings: FC<IModalSettings> = ({ isOpen, onDismiss }) => {

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <ModalContent onDismiss={onDismiss} />
    </Modal>
  );
};

const ModalContent: FC<Omit<IModalSettings, 'isOpen'>> = ({ onDismiss }) => {
  return (
    <div className="modal modal-settings">
      <div className="modal-header">
        <div className="title">
          <span>Settings</span>
        </div>
        <button type="button" className="btn btn-close" onClick={onDismiss}>
          <ImgClose className="icon"/>
        </button>
      </div>

      <div className="modal-content">
        <div className="controls">
          <IconSizeControl />
          <NumberBaseControl />
          <SystemFontControl />
        </div>
      </div>
    </div>
  );
};
