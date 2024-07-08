import { useCallback, useContext } from 'react';
import { AppConfig, AppConfigKey, ApplicationContext } from '@app-context';

export function useAppConfig<Key extends AppConfigKey, Value extends AppConfig<Key>>(key: Key): [Value, (value: Value) => void] {
  const { config, setConfig } = useContext(ApplicationContext);
  const configValue = config[key] as Value;

  const setConfigCallback = useCallback((value: Value) => setConfig(key, value), [setConfig]);

  return [configValue, setConfigCallback];
}