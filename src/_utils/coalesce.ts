/**
 * Get the first provided value that is not undefined or null
 * @param values A list of values to search through
 * @returns A single value
 */
export const coalesce = <T>(...values: T[]): T | undefined => (
  values.find((v) => (v !== undefined && v !== null))
);
