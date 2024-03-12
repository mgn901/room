import { TParameterize } from '../../utils/dto-of/TParameterize.ts';
import { Failure, Success, TResult } from '../../utils/result/TResult.ts';
import { IllegalAuthenticationTokenException } from '../player/PlayerContext.ts';
import { IWaitingPlayer } from './IWaitingPlayer.ts';
import { WaitingRoom } from './WaitingRoom.ts';

export const waitingRoomOwnerContextTypeSymbol = Symbol();

/** 特定の待合室のオーナーとしての操作を行えるコンテキストにあることを表すオブジェクト。 */
export class WaitingRoomOwnerContext {
  public readonly [waitingRoomOwnerContextTypeSymbol]: unknown;

  /** このコンテキストオブジェクトでのオーナーとしての操作が許可されている待合室のID。 */
  public readonly waitingRoomId: WaitingRoom['id'];

  private constructor(param: TParameterize<WaitingRoomOwnerContext>) {
    this.waitingRoomId = param.waitingRoomId;
  }

  public static create(param: {
    /** オーナーとして操作したい待合室のオブジェクト。 */
    readonly waitingRoom: WaitingRoom;
    /** 待合室のオーナーの認証トークン。 */
    readonly ownerAuthenticationToken: ReturnType<
      IWaitingPlayer['dangerouslyGetAuthenticationToken']
    >;
  }): TResult<
    {
      /** 待合室のオーナーとしての操作を許可するコンテキストオブジェクト。 */
      context: WaitingRoomOwnerContext;
    },
    IllegalAuthenticationTokenException
  > {
    if (
      param.ownerAuthenticationToken !==
      param.waitingRoom.players
        .find((player) => player.id === param.waitingRoom.ownerId)
        ?.dangerouslyGetAuthenticationToken()
    ) {
      return new Failure(new IllegalAuthenticationTokenException('認証トークンに誤りがあります。'));
    }

    return new Success({
      context: new WaitingRoomOwnerContext({ waitingRoomId: param.waitingRoom.id }),
    });
  }
}
