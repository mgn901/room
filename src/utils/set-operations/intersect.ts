import { dedupe } from './dedupe.ts';
import { defaultCompareFn } from './defaultCompareFn.ts';

/**
 * 2つの配列の共通部分を新たな配列として返す。
 * @param a 1つ目の配列。
 * @param b 2つ目の配列。
 * @param compareFn 比較関数。第1引数と第2引数を比較し、第1引数の方が前に来るならば-1以下の値を返し、第2引数の方が前に来るならば1以上の値を返し、等しければ0を返すような関数。
 * @returns 2つの配列の共通部分。
 */
export const intersect = <T>(
  a: readonly T[],
  b: readonly T[],
  compareFn: (a: Readonly<T>, b: Readonly<T>) => number = defaultCompareFn,
): T[] => {
  const as = dedupe(a, compareFn).sort(compareFn);
  const bs = dedupe(b, compareFn).sort(compareFn);

  return as.reduce<T[]>((result, current) => {
    // current: この回の呼び出しで読んでいる1つ目の配列の値。

    // 2つ目の配列の先頭がcurrentまたはcurrentより大きくなるまで、2つ目の配列の先頭を取り除く。
    while (bs.length !== 0 && compareFn(current, bs[0]) > 0) {
      bs.shift();
    }

    // 2つ目の配列が空になったら、何もしない。
    if (bs.length === 0) {
      return result;
    }

    // currentと2つ目の配列の先頭とを比較する。
    // 等しくなければ何もしない。
    // 等しければcurrentを結果に追加して2つ目の配列の先頭を取り除く。
    if (compareFn(current, bs[0]) !== 0) {
      return result;
    }
    // biome-ignore lint/style/noNonNullAssertion: bs[0]の存在は28行目で確認している。
    result.push(bs.shift()!);
    return result;
  }, []);
};
