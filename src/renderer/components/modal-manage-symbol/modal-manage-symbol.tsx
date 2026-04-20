import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { BtnCopy } from '../btn-copy/btn-copy';
import Modal, { ModalProps } from '../modal/modal';
import { useSymbolMeta } from '../../hooks/use-symbol-meta';
import { ImgClose } from '../images/img-close';
import { ImgSymbol } from '../images/img-symbol';
import { ImgStar } from '../images/img-star';
import { useFavorites } from '../../hooks/use-favorites';
import { SkinColorPicker } from '../skin-color-picker/skin-color-picker';
import { type Codepoint, SymbolSkinColor } from '@app-types';
import { genSymbolCodes, genSymbolView, SymbolCodeOutput } from '../../utils/gen-symbol-view';
import { useAppConfig } from '../../hooks/use-app-config';
import { AppConfigKey } from '@app-context';
import { ImgArrow } from '../images/img-arrow';
import { UNICODE_VS16 } from '../../constants/unicode';

export interface IModalCreateSymbol extends ModalProps {
  code?: Codepoint | null;
}

export const ModalManageSymbol: FC<IModalCreateSymbol> = ({ isOpen, onDismiss, code }) => {
  const codeRef = useRef<Codepoint | null>(code || null);

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
  const [fontFamily] = useAppConfig(AppConfigKey.FontFamily);
  const [defaultSkin, setDefaultSkin] = useAppConfig(AppConfigKey.SkinColor);

  const [code, setCode] = useState<Codepoint>(_code);
  const meta = useSymbolMeta(code);

  const [_skin, setSkin] = useState<SymbolSkinColor>(defaultSkin);
  const [variant, setVariant] = useState(Array.isArray(code) && code.includes(UNICODE_VS16))
  const skin = meta?.skin ? _skin : 0;
  const [isFavorite, toggleFavorite] = useFavorites(code);

  const codesSet = useMemo(() => genSymbolCodes(code, skin, variant), [code, skin, variant]);

  const html = genSymbolView(codesSet, SymbolCodeOutput.HTML);
  const css = genSymbolView(codesSet, SymbolCodeOutput.CSS);
  const hex = genSymbolView(codesSet, SymbolCodeOutput.HEX);
  const dec = genSymbolView(codesSet, SymbolCodeOutput.DEC);

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
            <span>{meta?.name}</span>
          </div>

          {meta?.block ? (
            <div className="block-name">
              <span>{meta.block}</span>
            </div>
          ) : null}
        </div>

        <div className="symbol-wrap">
          <BtnCopy className="symbol" text={String.fromCodePoint(...codesSet)}>
            <div style={{ fontFamily: fontFamily }}>
              <ImgSymbol code={codesSet} size={70}/>
            </div>
          </BtnCopy>

          <button
            className="btn btn-favorites"
            aria-label="Add to favorites"
            data-tooltip-pos="top"
            onClick={() => toggleFavorite()}
          >
            <ImgStar className="star" active={isFavorite}/>
          </button>
        </div>

        {meta?.skin ? (
          <div className="right-color-picker">
            <SkinColorPicker value={skin} onChange={setSkin} />

            <button type="button" className={`btn btn-primary ${skin === defaultSkin ? 'hidden' : ''}`} onClick={() => setDefaultSkin(skin)}>
              <span>Make it default</span>
            </button>
          </div>
        ) : (
          <div className="right-color-picker" />
        )}

        {Array.isArray(code) && code.includes(UNICODE_VS16) ? (
          <div className="variant-checkbox">
            <label className="checkbox">
              <input type="checkbox" checked={!variant} onChange={() => setVariant(!variant)} />
              Monochrome
            </label>
          </div>
        ) : (
          <div className="variant-checkbox" />
        )}

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

        {typeof code === 'number' ? (
          <div className="arrows">
            <button
              aria-label="Previous symbol"
              data-tooltip-pos="top"
              className="btn btn-arrow"
              onClick={() => setCode(code <= 1 ? code : code - 1)}
            >
              <ImgArrow direction="left"/>
            </button>

            <button
              aria-label="Next&nbsp;Symbol"
              data-tooltip-pos="top"
              className="btn btn-arrow"
              onClick={() => setCode(code >= 0xffffff ? code : code + 1)}
            >
              <ImgArrow direction="right"/>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
