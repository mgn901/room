import { TNominalPrimitive } from '../primitives/TNominalPrimitive.ts';

/**
 * 長い64文字のシークレット文字列を表す公称プリミティブ型。
 * 64文字の英数字、`_`および`_`から成る。
 */
const symbol = Symbol();
export type TLongSecret = TNominalPrimitive<string, typeof symbol>;

/**
 * 文字列が長いシークレットになりうるかを判定する関数。
 *
 * 64文字の英数字、`_`および`_`から成るかを判定する。
 *
 * @param value 判定対象の文字列。
 * @returns `value`がシークレット文字列になりうれば`true`を返し、`value`を`TLongSecret`とみなす。そうでなければ`false`を返す。
 */
export const isLongSecret = (value: string): value is TLongSecret => {
  const regexp = /^[a-zA-Z0-9-_]{64}$/;
  return regexp.test(value);
};

/**
 * 384ビットのシークレットを生成し、64文字の文字列として返す。
 * @returns 生成されたシークレット文字列。
 */
export const generateLongSecret = (): TLongSecret => {
  const array = new Uint8Array(48);
  globalThis.crypto.getRandomValues(array);
  const string = btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  if (!isLongSecret(string)) {
    throw new LongSecretGenerationFailedError('シークレットを生成できません。');
  }
  return string;
};

export class LongSecretGenerationFailedError extends Error {
  public readonly name = 'LongSecretGenerationFailedError';
}
