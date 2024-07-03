type DebounceCallback<T> = (value: T) => void;

export function debounce<T>(callback: (value: T) => void, delay: number): DebounceCallback<T> {
  let _innerValue: T;
  let _skip = false;

  const _fn = () => {
    callback(_innerValue);
    _skip = false;
  };

  return (v: T) => {
    _innerValue = v;
    if (!_skip) {
      _skip = true;
      setTimeout(_fn, delay);
    }
  };
}