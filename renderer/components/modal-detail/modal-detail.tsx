import { FC, useEffect, useRef } from 'react';
import Modal, { ModalProps } from '../modal/modal';
import CloseIcon from '../../svg/close.svg?react';

export interface IModalDetail extends ModalProps {
  code?: number;
}

export const ModalDetail: FC<IModalDetail> = ({ code, isOpen, onDismiss }) => {
  const codeRef = useRef<number | undefined>(code);

  useEffect(() => {
    if (code) {
      codeRef.current = code;
    }
  }, [code]);

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      {codeRef.current || isOpen || code ? <ModalContent code={codeRef.current || code} isOpen={true} onDismiss={onDismiss} /> : null}
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
          <span dangerouslySetInnerHTML={{ __html: String.fromCharCode(code) }}/>
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