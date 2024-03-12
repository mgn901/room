import { dedupe } from './dedupe.ts';
import { defaultCompareFn } from './defaultCompareFn.ts';

/**
 * 2つの配列の和を新たな配列として返す。
 * @param a 1つ目の配列。
 * @param b 2つ目の配列。
 * @param compareFn 第1引数と第2引数を比較し、第1引数の方が前に来るならば-1以下の値を返し、第2引数の方が前に来るならば1以上の値を返し、等しければ0を返すような関数。
 * @returns 2つの配列の和。
 */
export const union = <T>(
  a: readonly T[],
  b: readonly T[],
  compareFn: (a: Readonly<T>, b: Readonly<T>) => number = defaultCompareFn,
): T[] => dedupe([...a, ...b], compareFn);
