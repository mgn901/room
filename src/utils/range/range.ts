/**
 * `start`以上`end`未満の数値を`step`間隔で生成したものの配列を返す。
 */
export const range = (start: number, end: number, step = 1) =>
  [...Array(Math.ceil((end - start) / step)).keys()].map((_, index) => start + index * step);
