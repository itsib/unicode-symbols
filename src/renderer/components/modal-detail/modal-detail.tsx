import { FC, useEffect, useRef } from 'react';
import { BtnCopy } from '../btn-copy/btn-copy';
import Modal, { ModalProps } from '../modal/modal';
import { ImgClose } from '../images/img-close';

export interface IModalDetail extends Omit<ModalProps, 'isOpen'> {
  code?: number;
  name?: string;
  mnemonic?: string;
}

export const ModalDetail: FC<IModalDetail> = ({ onDismiss, code, name, mnemonic }) => {
  const codeRef = useRef<number | undefined>(code);
  const nameRef = useRef<string | undefined>(name);
  const mnemonicRef = useRef<string | undefined>(mnemonic);

  useEffect(() => {
    if (code) {
      codeRef.current = code;
      nameRef.current = name;
      mnemonicRef.current = mnemonic;
    }
  }, [code, name, mnemonic]);

  return (
    <Modal isOpen={!!code} onDismiss={onDismiss}>
      {codeRef.current || code ? (
        <ModalContent
          onDismiss={onDismiss}
          name={name || nameRef.current}
          code={code || codeRef.current}
          mnemonic={mnemonic || mnemonicRef.current}
        />
      ) : null}
    </Modal>
  );
};

const ModalContent: FC<Required<IModalDetail>> = ({ name, code, mnemonic, onDismiss }) => {
  const html = `&#${code.toString(10)};`;
  const css = `\\${code.toString(16)}`;

  return (
    <div className="modal modal-detail">
      <div className="modal-header">
        <div className="title">
          {name ? (
            <span>{name}</span>
          ) : (
            <>
              <span className="text-secondary">Unicode Character</span>
              &nbsp;
              <span>{`U+${code.toString(16).toUpperCase()}`}</span>
            </>
          )}
        </div>
        <button type="button" className="btn btn-close" onClick={onDismiss}>
          <ImgClose className="icon" />
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
