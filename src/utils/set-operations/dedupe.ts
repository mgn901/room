import { defaultCompareFn } from './defaultCompareFn.ts';

/**
 * 渡された配列から、重複した要素を排除したものを新たな配列として返す。
 * @param array 重複排除の対象の配列。
 * @param compareFn 重複判定に用いる比較関数。第1引数と第2引数を比較し、第1引数の方が前に来るならば-1以下の値を返し、第2引数の方が前に来るならば1以上の値を返し、等しければ0を返すような関数。
 * @returns 重複を排除した配列。
 */
export const dedupe = <T>(
  array: readonly T[],
  compareFn: (a: Readonly<T>, b: Readonly<T>) => number = defaultCompareFn,
): T[] =>
  [...array].sort(compareFn).reduce<T[]>((result, current) => {
    // current: この回の呼び出しで読んでいる配列の値。

    // 前に結果に追加した値とcurrentとを比較する。
    // 等しければ何もしない。
    // 等しくなければcurrentを結果に追加する。
    if (result.length !== 0 && compareFn(current, result[result.length - 1]) === 0) {
      return result;
    }
    result.push(current);
    return result;
  }, []);
