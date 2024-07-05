import { useEffect, useState } from 'react';

export function useSymbolName(id?: number): string | undefined | null {
  const [name, setName] = useState<string | undefined | null>(null);

  useEffect(() => {
    if (id == null) {
      return;
    }
    window.appAPI.getSymbolName(id)
      .then(name => setName(name))
      .catch(error => {
        console.error(error);
        setName(undefined);
      })

  }, [id]);

  return name;
}