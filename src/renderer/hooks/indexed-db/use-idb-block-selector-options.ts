import { useEffect, useState } from 'react';
import { useIdbInstance } from './use-idb-instance';
import { FormControlOption } from '../../types/form/form-control-option';
import { IndexedDbStore } from '@app-context';
import { IdbBlock } from '@app-types';
import { showIdbError } from '../../utils/indexed-db';

const FIRST_OPTION: FormControlOption<number> = {
  value: 0,
  label: 'Search in all sections',
}

export function useIdbBlockSelectorOptions(plane = 1): FormControlOption<number>[] {
  const database = useIdbInstance();
  const [options, setOptions] = useState<FormControlOption<number>[]>([FIRST_OPTION]);

  useEffect(() => {
    if (!database) {
      return setOptions([FIRST_OPTION]);
    }

    const keyOnly = IDBKeyRange.only(plane);
    const transaction = database.transaction([IndexedDbStore.Blocks], 'readonly');
    const request = transaction.objectStore(IndexedDbStore.Blocks).index('plane').openCursor(keyOnly);

    const options: FormControlOption<number>[] = [FIRST_OPTION];
    let finished = false;

    request.onsuccess = (event) => {
      const cursor = (event.target as any).result;
      if (cursor) {
        const block = cursor.value as IdbBlock;
        options.push({ label: block.n, value: block.i });

        cursor.continue();
      } else {
        finished = true;
        setOptions(options);
      }
    };

    transaction.onerror = error => {
      finished = true;
      showIdbError(error);
    };

    return () => {
      if (!finished) {
        transaction.abort();
      }
    };
  }, [plane, database]);

  return options;
}