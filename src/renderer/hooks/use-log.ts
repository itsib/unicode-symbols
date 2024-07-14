import { useEffect, useRef, useState } from 'react';

const STACK_CALL_REGEX = /^at\s([a-zA-Z0-9]+)\s/;

function getCallsTrace(): string[] {
  const stack = new Error().stack || '';
  return stack
    .split('\n')
    .map((line: string): string => {
      line = line.trim();
      if (line === 'Error' || line.includes('getCallsTrace') || line.includes('useLog')) {
        return '';
      }
      const result = STACK_CALL_REGEX.exec(line);
      return result === null || result[1] === undefined ? '' : result[1];
    })
    .filter(i => !!i);
}

function renderCallTrace(callsTrace: string[]): void {
  console.groupCollapsed('%cCall trace', 'color: #77777a; font-weight: 400');
  callsTrace.forEach((call, index) => {
    console.info(`${index}:%c ${call}`, 'color: #bada55');
  });
  console.groupEnd();
}

/**
 * Generates the same unique color for the string value (salt).
 * CYRB53 Hash Algorithm
 *
 * @param str any string
 * @param seed if you need different colors for same string
 */
export function hexColorByAnyString(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;

  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return '#' + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).substring(0, 6);
}

export interface LogOpts {
  showTrace?: boolean;
  color?: boolean;
}

export function useLog(_values: { [name: string]: any }, { showTrace = false, color = true }: LogOpts = {}): void {
  const callsTrace = showTrace ? getCallsTrace() : undefined;
  const [values, setValues] = useState<{ [name: string]: any } | null>(null);
  const valuesRef = useRef({} as { [name: string]: any });

  // Watch to values changes
  useEffect(() => {
    if (!_values || typeof _values !== 'object') {
      valuesRef.current = {};
      return setValues(null);
    }

    const names = Object.keys(_values);
    if (names.length !== Object.keys(valuesRef.current).length) {
      setValues(_values);
      valuesRef.current = _values;
    }

    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const value = _values[name];

      if (valuesRef.current[name] === value) {
        continue;
      }
      setValues(_values);
      break;
    }
    valuesRef.current = _values;
  }, [_values]);

  // Print logs
  useEffect(() => {
    if (/*import.meta.env.PROD || */!values) {
      return;
    }

    const names = Object.keys(values);
    for (let i = 0; i < names.length; i++) {
      const name = names[i];

      if (color) {
        const _color = name.toLowerCase().includes('err') ? '#FF0000' : hexColorByAnyString(name);

        console.log(`%c%s:%o`, `color: ${_color}`, name, values[name]);
      } else {
        console.log(`%s:%o`, name, values[name]);
      }
    }

    if (callsTrace) {
      renderCallTrace(callsTrace);
    }
  }, [values, callsTrace, color]);
}