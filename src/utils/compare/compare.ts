/**
 * 文字列または数値を比較する。
 * @param a 比較する文字列または数値
 * @param b 比較する文字列または数値
 * @returns 昇順で並べ替えた際に`a`が`b`の前に来る場合は`-1`、`a`と`b`が等しければ`0`、`a`が`b`の後ろに来る場合は`1`を返す。
 */
export const compare = <T extends string | number>(a: T, b: T): number => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};
