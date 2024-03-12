import { type TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import { type TId } from '../../utils/random-values/TId.ts';
import { type TLongSecret } from '../../utils/random-values/TLongSecret.ts';
import { type playerTypeSymbol } from '../player/Player.ts';

export const waitingPlayerTypeSymbol = Symbol();

/** 待合室にいるプレイヤーを表すインターフェイス。 */
export interface IWaitingPlayer {
  readonly [waitingPlayerTypeSymbol]: unknown;
  readonly id: TNominalPrimitive<TId, typeof playerTypeSymbol>;
  dangerouslyGetAuthenticationToken(): TLongSecret;
}
