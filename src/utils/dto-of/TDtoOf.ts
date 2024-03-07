export type TDtoOf<E extends object> = {
  [k in keyof E as E[k] extends (...args: never) => unknown ? never : k]: E[k];
};
