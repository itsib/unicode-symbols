import React, { type FC, type PropsWithChildren, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const Modal: FC<PropsWithChildren<ModalProps>> = ({ isOpen, onDismiss, children }) => {
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null);
  const [, setShowUp] = useState(false);
  const [isAnimated] = useState(false);
  const isAnimatedRef = useRef(isAnimated);
  isAnimatedRef.current = isAnimated;

  useEffect(() => {
    if (!isOpen || !window || !overlay) {
      return;
    }

    const scrollHandler = (event: Event): void => {
      setShowUp(!!(event.target as HTMLDivElement).scrollTop);
    };

    overlay.addEventListener('scroll', scrollHandler);

    return () => {
      overlay.removeEventListener('scroll', scrollHandler);
    };
  }, [overlay, isOpen]);

  return isOpen || isAnimated ? (
    <>
      {createPortal(
        <div aria-label="dialog overlay" className="modal-overlay" onClick={() => onDismiss()} ref={setOverlay}>
          <div aria-label="dialog content" className="modal-overlay-content" onClick={event => event.stopPropagation()}>
            {children}
          </div>
        </div>,
        document.body,
      )}
    </>
  ) : null;
};

export default Modal;
