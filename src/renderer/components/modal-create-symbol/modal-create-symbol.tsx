import { FC, useEffect, useRef } from 'react';
import { BtnCopy } from '../btn-copy/btn-copy';
import Modal, { ModalProps } from '../modal/modal';
import { useIdbGetSymbol } from '../../hooks/indexed-db/use-idb-get-symbol';
import { ImgClose } from '../images/img-close';

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
  const symbol = useIdbGetSymbol(code);

  const html = `&#${code.toString(10)};`;
  const css = `\\${code.toString(16)}`;

  return (
    <div className="modal modal-create-symbol">
      <div className="modal-header">
        <div className="title">
          <>
            <span className="text-secondary">Unicode Symbol</span>
            &nbsp;
            <span>{`U+${code.toString(16).toUpperCase()}`}</span>
          </>
        </div>
        <button type="button" className="btn btn-close" onClick={onDismiss}>
          <ImgClose className="icon" />
        </button>
      </div>

      <div className="modal-content">
        <div className="info">
          <div className="name">
            <span>{symbol?.name}</span>
          </div>

          {symbol?.block ? (
            <div className="block-name">
              <span>{symbol.block}</span>
            </div>
          ) : null}
        </div>


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
