import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { AppConfig, AppConfigKey, APPLICATION_CONTEXT_DEFAULT, ApplicationContext } from './application.context';

export const ApplicationProvider: FC<PropsWithChildren> = ({ children }) => {
  const [configValue, setConfigValue] = useState<{ [ Key in AppConfigKey ]: AppConfig<Key> } | null>(null);

  const setConfig = useCallback(function <K extends AppConfigKey, T extends AppConfig<K>>(key: K, value: T) {
    setConfigValue(_config => ({ ..._config, [key]: value }));
    localStorage.setItem(`app-config-${key}`, JSON.stringify(value));
  }, []);

  // Restore app configuration
  useEffect(() => {
    const keys = Object.values(AppConfigKey).filter(key => typeof key === 'number');
    for (const key of keys) {
      let value = localStorage.getItem(`app-config-${key}`);
      if (!value) {
        value = JSON.stringify((APPLICATION_CONTEXT_DEFAULT.config as any)[key]);
        localStorage.setItem(`app-config-${key}`, value);
      }

      if (value) {
        setConfigValue(_config => ({ ..._config, [key]: JSON.parse(value) }));
      }
    }
  }, []);

  // Manage context menu
  useEffect(() => {
    const findCode = (element: HTMLElement, depth = 4): number | undefined => {
      if (element?.dataset?.code != null) {
        return Number(element.dataset.code);
      }
      if (depth > 0) {
        return findCode(element?.parentElement, depth - 1)
      }
      return undefined;
    };

    const onContextmenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const code = findCode(event.target as HTMLElement);

      const position = {
        x: event.pageX,
        y: event.pageY,
      }

      window.appAPI.menu({ code, position });
    };

    document.body.addEventListener('contextmenu', onContextmenu);
    return () => {
      document.body.removeEventListener('contextmenu', onContextmenu);
    }
  }, []);

  return (
    <ApplicationContext.Provider value={{ config: configValue, setConfig }}>
      {configValue === null ? null : children}
    </ApplicationContext.Provider>
  );
};
