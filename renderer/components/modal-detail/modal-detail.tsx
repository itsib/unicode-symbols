import { FC, useEffect, useRef } from 'react';
import CloseIcon from '../../svg/close.svg?react';
import { BtnCopy } from '../btn-copy/btn-copy';
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

        <BtnCopy className="symbol" text={String.fromCodePoint(code)}>
          <span dangerouslySetInnerHTML={{ __html: html }}/>
        </BtnCopy>


        <div className="table-codes">
          <div className="label">Unicode</div>
          <BtnCopy className="value" text={unicode}>{unicode}</BtnCopy>

          <div className="label">HTML code</div>
          <BtnCopy className="value" text={html}>{html}</BtnCopy>

          <div className="label">CSS code</div>
          <BtnCopy className="value" text={css}>{css}</BtnCopy>
        </div>
      </div>
    </div>
  );
};
