import { FC, useEffect, useRef } from 'react';
import CloseIcon from '../../svg/close.svg?react';
import Modal, { ModalProps } from '../modal/modal';

export interface IModalDetail extends Omit<ModalProps, 'isOpen'> {
  code?: number;
}

export const ModalDetail: FC<IModalDetail> = ({ onDismiss, code }) => {
  const codeRef = useRef<number | undefined>(code);

  useEffect(() => {
    if (code) {
      codeRef.current = code;
    }
  }, [code]);

  return (
    <Modal isOpen={!!code} onDismiss={onDismiss}>
      {codeRef.current || code ? <ModalContent onDismiss={onDismiss} code={code || codeRef.current} /> : null}
    </Modal>
  );
};

const ModalContent: FC<Required<IModalDetail>> = ({ code, onDismiss }) => {
  const unicode = `U+${code.toString(16).toUpperCase()}`;
  const html = `&#${code.toString(10)};`;
  const css = `\\${code.toString(16)}`;

  return (
    <div className="modal modal-detail">
      <div className="modal-header">
        <div className="title">
          <span>Unicode Character</span>
        </div>
        <button type="button" className="btn btn-close" onClick={() => onDismiss?.()}>
          <CloseIcon className="icon"/>
        </button>
      </div>
      <div className="modal-content">

        <div className="symbol">
          <span dangerouslySetInnerHTML={{ __html: html }}/>
        </div>

        <div className="presentation unicode">
          <span>Unicode <b>{unicode}</b></span>
        </div>
        <div className="presentation html">
          <span>HTML code <b>{html}</b></span>
        </div>
        <div className="presentation html">
          <span>CSS code <b>{css}</b></span>
        </div>
      </div>
    </div>
  );
}