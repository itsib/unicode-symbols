import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { BtnCopy } from '../btn-copy/btn-copy';
import Modal, { ModalProps } from '../modal/modal';
import { useIdbGetSymbolMeta } from '../../hooks/indexed-db/use-idb-get-symbol-meta';
import { ImgClose } from '../images/img-close';
import { ImgSymbol } from '../images/img-symbol';
import { ImgStar } from '../images/img-star';
import { useFavorites } from '../../hooks/use-favorites';
import { SkinColorPicker } from '../skin-color-picker/skin-color-picker';
import { SymbolSkinColor } from '@app-types';
import { genSymbolView, genSymbolCodes, SymbolCodeOutput } from '../../utils/gen-symbol-view';
import { useAppConfig } from '../../hooks/use-app-config';
import { AppConfigKey } from '@app-context';
import { useLog } from '../../hooks/use-log';
import { ImgArrow } from '../images/img-arrow';

export interface IModalCreateSymbol extends ModalProps {
  code?: number;
}

export const ModalManageSymbol: FC<IModalCreateSymbol> = ({ isOpen, onDismiss, code }) => {
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

const ModalContent: FC<Required<Omit<IModalCreateSymbol, 'isOpen'>>> = ({ code: _code, onDismiss }) => {
  const [code, setCode] = useState(_code);
  const symbolMeta = useIdbGetSymbolMeta(code);
  const [defaultSkin, setDefaultSkin] = useAppConfig(AppConfigKey.SkinColor);
  const [_skin, setSkin] = useState<SymbolSkinColor>(defaultSkin);
  const skin = symbolMeta?.skin ? _skin : 0;
  const [isFavorite, toggleFavorite] = useFavorites(code);

  const codesSet = useMemo(() => genSymbolCodes(code, skin), [code, skin]);

  const isSupportArrow = code < 0xffffffff && !(code.toString(16).length === 6 && code.toString(16).endsWith('20e3'));

  const html = genSymbolView(codesSet, SymbolCodeOutput.HTML);
  const css = genSymbolView(codesSet, SymbolCodeOutput.CSS);
  const hex = genSymbolView(codesSet, SymbolCodeOutput.HEX);
  const dec = genSymbolView(codesSet, SymbolCodeOutput.DEC);

  useLog({ isSupportArrow });

  return (
    <div className="modal modal-manage-symbol">
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
            <span>{symbolMeta?.name}</span>
          </div>

          {symbolMeta?.block ? (
            <div className="block-name">
              <span>{symbolMeta.block}</span>
            </div>
          ) : null}
        </div>

        <div className="symbol-wrap">
          <button
            className="btn btn-favorites"
            aria-label="Add to favorites"
            data-tooltip-pos="top"
            onClick={() => toggleFavorite()}
          >
            <ImgStar className="star" active={isFavorite}/>
          </button>

          <BtnCopy className="symbol" text={String.fromCodePoint(...codesSet)}>
            <ImgSymbol code={html} size={70} />
          </BtnCopy>

          {symbolMeta?.skin ? (
            <div className="right-color-picker">
              <SkinColorPicker value={skin} onChange={setSkin} />

              <button type="button" className={`btn btn-primary ${skin === defaultSkin ? 'hidden' : ''}`} onClick={() => setDefaultSkin(skin)}>
                <span>Make it default</span>
              </button>
            </div>
          ) : null}
        </div>

        <div className="options">
          <div className="table-codes">
            <div className="label">Code</div>
            <BtnCopy className="value" text={dec}>{dec}</BtnCopy>

            <div className="label">Hex Code</div>
            <BtnCopy className="value" text={hex}>{hex}</BtnCopy>

            <div className="label">HTML code</div>
            <BtnCopy className="value" text={html}>{html}</BtnCopy>

            <div className="label">CSS code</div>
            <BtnCopy className="value" text={css}>{css}</BtnCopy>
          </div>
        </div>

        {isSupportArrow ? (
          <div className="arrows">
            <button
              aria-label="Previous symbol"
              data-tooltip-pos="top"
              className="btn btn-arrow"
              onClick={() => setCode(i => (i <= 1 ? i : i - 1))}
            >
              <ImgArrow direction="left"/>
            </button>

            <button
              aria-label="Next&nbsp;Symbol"
              data-tooltip-pos="top"
              className="btn btn-arrow"
              onClick={() => setCode(i => (i >= 0xffffffff ? i : i + 1))}
            >
              <ImgArrow direction="right"/>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
