export function extractError(error: any): Error {
  return new Error((error?.target as any)?.error);
}
