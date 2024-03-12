import { type TParameterize } from '../../utils/dto-of/TParameterize.ts';
import { Failure, Success, type TResult } from '../../utils/result/TResult.ts';
import { type Player } from '../player/Player.ts';
import { IllegalAuthenticationTokenException } from '../player/PlayerContext.ts';
import { type Game } from './Game.ts';

export const gamePlayerContextTypeSymbol = Symbol();

/** 特定の競技の操作を行えるコンテキストにあることを表すオブジェクト。 */
export class GamePlayerContext {
  public readonly [gamePlayerContextTypeSymbol]: unknown;

  /** このコンテキストオブジェクトでの操作が許可されている競技のID。 */
  public readonly gameId: Game['id'];

  private constructor(param: TParameterize<GamePlayerContext>) {
    this.gameId = param.gameId;
  }

  public static create(param: {
    /** 操作したい競技のオブジェクト。 */
    readonly target: Game;
    /** 操作したい競技の認証トークン。 */
    readonly authenticationToken: ReturnType<Player['dangerouslyGetAuthenticationToken']>;
  }): TResult<{ context: GamePlayerContext }, IllegalAuthenticationTokenException> {
    if (
      !param.target.players.some(
        (player) => param.authenticationToken === player.dangerouslyGetAuthenticationToken(),
      )
    ) {
      return new Failure(new IllegalAuthenticationTokenException('認証トークンに誤りがあります。'));
    }
    return new Success({ context: new GamePlayerContext({ gameId: param.target.id }) });
  }
}
