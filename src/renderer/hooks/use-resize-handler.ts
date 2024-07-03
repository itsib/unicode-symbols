import { MutableRefObject, useEffect } from 'react';

const MIN_FONT_SIZE = 30;
const MAX_FONT_SIZE = 65;
const STEP_SIZE_PERCENT = 5;

const resize = (page: HTMLDivElement, delta?: number) => {
  const zoomPrev = parseInt(localStorage.getItem('zoom') ?? '50');
  const zoomNext = delta == null ? zoomPrev : delta < 0 ? zoomPrev + STEP_SIZE_PERCENT : zoomPrev - STEP_SIZE_PERCENT;
  const zoom =  Math.round(Math.max(Math.min(zoomNext, 100), 0)); // in %

  localStorage.setItem('zoom', `${zoom}`);

  const fontSize = MIN_FONT_SIZE + ((MAX_FONT_SIZE - MIN_FONT_SIZE) * (zoom / 100));
  page.style.fontSize = `${fontSize}px`;
};

export function useResizeHandler(pageRef: MutableRefObject<HTMLDivElement | null>) {

  // Size of icons
  useEffect(() => {
    const page = pageRef.current;

    resize(page);

    const onResize = (event: WheelEvent) => {
      if (!event.ctrlKey) {
        return;
      }

      // New size computation
      const page = event.currentTarget as HTMLDivElement;
      resize(page, event.deltaY);
    }

    page.addEventListener('wheel', onResize);
    return () => {
      page.removeEventListener('wheel', onResize);
    }
  }, []);
}