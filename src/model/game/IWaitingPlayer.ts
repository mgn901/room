import { TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import { TId } from '../../utils/random-values/TId.ts';
import { TLongSecret } from '../../utils/random-values/TLongSecret.ts';
import { playerTypeSymbol } from '../player/Player.ts';

export const waitingPlayerTypeSymbol = Symbol();

/** 待合室にいるプレイヤーを表すインターフェイス。 */
export interface IWaitingPlayer {
  readonly [waitingPlayerTypeSymbol]: unknown;
  readonly id: TNominalPrimitive<TId, typeof playerTypeSymbol>;
  dangerouslyGetAuthenticationToken(): TLongSecret;
}
