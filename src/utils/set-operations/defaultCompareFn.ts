export const defaultCompareFn = <T>(a: Readonly<T>, b: Readonly<T>): number => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};
