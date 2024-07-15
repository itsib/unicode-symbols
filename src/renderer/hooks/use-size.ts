import { useEffect, useState } from 'react';
import { Size } from '@app-types';

export function useSize(elementId: string): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  // Window resize handler
  useEffect(() => {
    const element = document.getElementById(elementId);
    if (!element) {
      return setSize({ width: 0, height: 0 });
    }

    const updateSize = () => {
      setSize({ width: element.offsetWidth, height: element.offsetHeight });
    };
    updateSize();

    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [elementId]);

  return size;
}