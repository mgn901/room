import { dedupe } from './dedupe.ts';
import { defaultCompareFn } from './defaultCompareFn.ts';
import { intersect } from './intersect.ts';

/**
 * 2つの配列の差集合を新たな配列として返す。
 * @param minuned 引かれる集合を表す配列。
 * @param subtrahend 引く集合を表す配列。
 * @param compareFn 比較関数。第1引数と第2引数を比較し、第1引数の方が前に来るならば-1以下の値を返し、第2引数の方が前に来るならば1以上の値を返し、等しければ0を返すような関数。
 * @returns `minuined`から`subtrahend`を引いた差集合。
 */
export const except = <T>(
  minuned: readonly T[],
  subtrahend: readonly T[],
  compareFn: (a: Readonly<T>, b: Readonly<T>) => number = defaultCompareFn,
): T[] => {
  const m = dedupe(minuned, compareFn).sort(compareFn);
  const s = dedupe(subtrahend, compareFn).sort(compareFn);
  const intersection = intersect(m, s, compareFn);

  return m.reduce<T[]>((result, current, currentIndex) => {
    // current: この回の呼び出しで読んでいる1つ目の配列の値。

    // 共通部分が空になったら、1つ目の配列のcurrent以降の値を結果に追加する。
    if (intersection.length === 0) {
      result.push(...m.splice(currentIndex));
      return result;
    }

    // currentと共通部分の先頭とを比較する。
    // 等しければ共通部分の先頭を取り除く。
    // 等しくなければcurrentを結果に追加する。
    if (compareFn(current, intersection[0]) === 0) {
      intersection.shift();
      return result;
    }
    result.push(current);
    return result;
  }, []);
};
