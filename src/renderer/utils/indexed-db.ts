

export function IDBExtractError(error: any): string {
  return (error?.target as any)?.error;
}

export function showIdbError(error: Event): void {
  if ((error.target as IDBRequest).error.name !== 'AbortError') {
    console.error((error.target as IDBRequest).error.message)
  }
}