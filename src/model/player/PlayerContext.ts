import { TParameterize } from '../../utils/dto-of/TParameterize.ts';
import { TLongSecret } from '../../utils/random-values/TLongSecret.ts';
import { Failure, Success, TResult } from '../../utils/result/TResult.ts';
import { ApplicationErrorOrException } from '../errors/ApplicationErrorOrException.ts';
import { IWaitingPlayer } from '../game/IWaitingPlayer.ts';
import { Player } from './Player.ts';

export const playerContextTypeSymbol = Symbol();

/** 特定のプレイヤーの操作を行えるコンテキストにあることを表すオブジェクト。 */
export class PlayerContext {
  public readonly [playerContextTypeSymbol]: unknown;

  /** このコンテキストオブジェクトでの操作が許可されているプレイヤーのID。 */
  public readonly playerId: Player['id'];

  private constructor(param: TParameterize<PlayerContext>) {
    this.playerId = param.playerId;
  }

  public static create(param: {
    /** 操作したいプレイヤーのオブジェクト。 */
    readonly target: Player | IWaitingPlayer;
    /** 操作したいプレイヤーの認証トークン。 */
    readonly authenticationToken: TLongSecret;
  }): TResult<
    {
      /** プレイヤーの操作を許可するコンテキストオブジェクト。 */
      context: PlayerContext;
    },
    IllegalAuthenticationTokenException
  > {
    if (param.target.dangerouslyGetAuthenticationToken() !== param.authenticationToken) {
      return new Failure(new IllegalAuthenticationTokenException('認証トークンに誤りがあります。'));
    }

    return new Success({ context: new PlayerContext({ playerId: param.target.id }) });
  }
}

export class IllegalAuthenticationTokenException extends ApplicationErrorOrException {
  public readonly name = 'IllegalAuthenticationTokenException';
}
