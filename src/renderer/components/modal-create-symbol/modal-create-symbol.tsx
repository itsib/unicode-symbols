import { FC, useEffect, useRef } from 'react';
import CloseIcon from '../../../assets/images/close.svg';
import { BtnCopy } from '../btn-copy/btn-copy';
import Modal, { ModalProps } from '../modal/modal';

export interface IModalCreateSymbol extends ModalProps {
  code?: number;
}

export const ModalCreateSymbol: FC<IModalCreateSymbol> = ({ isOpen, onDismiss, code }) => {
  const codeRef = useRef<number | undefined>(code);

  useEffect(() => {
    if (code) {
      codeRef.current = code;
    }
  }, [code]);

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      {codeRef.current || code ? <ModalContent onDismiss={onDismiss} code={code || codeRef.current} /> : null}
    </Modal>
  );
};

const ModalContent: FC<Required<Omit<IModalCreateSymbol, 'isOpen'>>> = ({ code, onDismiss }) => {
  const html = `&#${code.toString(10)};`;
  const css = `\\${code.toString(16)}`;

  return (
    <div className="modal modal-create-symbol">
      <div className="modal-header">
        <div className="title">
          <span className="text-secondary">Unicode Symbol</span>
          &nbsp;
          <span>{`U+${code.toString(16).toUpperCase()}`}</span>
        </div>
        <button type="button" className="btn btn-close" onClick={onDismiss}>
          <img src={CloseIcon} alt="Close" className="icon"/>
        </button>
      </div>

      <div className="modal-content">
        <BtnCopy className="symbol" text={String.fromCodePoint(code)}>
          <span dangerouslySetInnerHTML={{ __html: html }}/>
        </BtnCopy>

        <div className="table-codes">
          <div className="label">Code</div>
          <BtnCopy className="value" text={code.toString(10)}>{code.toString(10)}</BtnCopy>

          <div className="label">Hex Code</div>
          <BtnCopy className="value" text={'0x' + code.toString(16).toUpperCase()}>{'0x' + code.toString(16).toUpperCase()}</BtnCopy>

          <div className="label">HTML code</div>
          <BtnCopy className="value" text={html}>{html}</BtnCopy>

          <div className="label">CSS code</div>
          <BtnCopy className="value" text={css}>{css}</BtnCopy>
        </div>
      </div>
    </div>
  );
};
