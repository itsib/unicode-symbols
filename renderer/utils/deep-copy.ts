export function deepCopy<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(deepCopy) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const returns: any = {};
    for (const key in value) {
      returns[key] = deepCopy(value[key]);
    }
    return returns as T;
  }

  return value;
}