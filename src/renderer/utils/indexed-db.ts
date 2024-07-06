

export function IDBExtractError(error: any): string {
  return (error?.target as any)?.error;
}