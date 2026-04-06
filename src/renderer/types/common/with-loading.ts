/**
 * T - data type
 * undefined - no data (not found, error, or etc.)
 * null - data is loading (fetching query, or db query in process)
 */
export type WithLoading<T> = T | undefined | null
