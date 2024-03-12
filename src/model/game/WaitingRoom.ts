import { TDtoOf } from '../../utils/dto-of/TDtoOf.ts';
import { TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import { TId, generateId } from '../../utils/random-values/TId.ts';
import { TLongSecret, generateLongSecret } from '../../utils/random-values/TLongSecret.ts';
import { TShortSecret, generateShortSecret } from '../../utils/random-values/TShortSecret.ts';
import { Failure, Success, TResult } from '../../utils/result/TResult.ts';
import { MAX_PLAYER_COUNT } from '../constants.ts';
import { ApplicationErrorOrException } from '../errors/ApplicationErrorOrException.ts';
import { IllegalContextException } from '../errors/IllegalContextException.ts';
import { PlayerContext } from '../player/PlayerContext.ts';
import { gameTypeSymbol } from './Game.ts';
import { IWaitingPlayer, waitingPlayerTypeSymbol } from './IWaitingPlayer.ts';
import { WaitingRoomOwnerContext } from './WaitingRoomOwnerContext.ts';

export const waitingRoomTypeSymbol = Symbol();

/** 待合室を表すエンティティクラス。 */
export class WaitingRoom {
  public readonly [waitingRoomTypeSymbol]: unknown;

  /** 待合室のID。後に作成される競技のIDと同じである。 */
  public readonly id: TNominalPrimitive<TId, typeof gameTypeSymbol>;

  /** 待合室に参加するための秘密の文字列。 */
  private readonly secret: TShortSecret;

  /** 待合室にいるプレイヤーの一覧。 */
  public readonly players: Readonly<WaitingPlayer[]>;

  /** 待合室のオーナーのID。待合室を作成したプレイヤーのIDと同じ。 */
  public readonly ownerId: WaitingPlayer['id'];

  //#region コンストラクタ他
  private constructor(
    param: Omit<TDtoOf<WaitingRoom>, typeof waitingRoomTypeSymbol> & {
      secret: WaitingRoom['secret'];
    },
  ) {
    this.id = param.id;
    this.secret = param.secret;
    this.players = param.players;
    this.ownerId = param.ownerId;
  }

  public static fromDto(
    param: Omit<TDtoOf<WaitingRoom>, typeof waitingRoomTypeSymbol> & {
      secret: WaitingRoom['secret'];
    },
  ): WaitingRoom {
    return new WaitingRoom(param);
  }
  //#endregion

  /** 待合室のオブジェクトを作成する。 */
  public static create(): Success<{
    /** 作成された待合室のオブジェクト。 */
    waitingRoom: WaitingRoom;
  }> {
    const owner = new WaitingPlayer();
    return new Success({
      waitingRoom: new WaitingRoom({
        id: generateId() as WaitingRoom['id'],
        secret: generateShortSecret(),
        players: [owner],
        ownerId: owner.id,
      }),
    });
  }

  /** 待合室に新しいプレイヤーが参加した後のオブジェクトを得る。 */
  public toJoined(param: {
    /** この待合室に参加するための秘密の文字列。 */
    readonly secret: WaitingRoom['secret'];
  }): TResult<
    {
      /** 新しいプレイヤーが参加した後の待合室のオブジェクト。 */
      waitingRoom: WaitingRoom;
      /** 新しいプレイヤーのオブジェクト。 */
      newPlayer: WaitingPlayer;
    },
    InvalidSecretException | MaxPlayerCountExceededException
  > {
    if (param.secret !== this.secret) {
      return new Failure(new InvalidSecretException('秘密の文字列に誤りがあります。'));
    }

    if (MAX_PLAYER_COUNT < this.players.length + 1) {
      return new Failure(
        new MaxPlayerCountExceededException(
          `1回に参加できる人数は最大${MAX_PLAYER_COUNT}人までです。`,
        ),
      );
    }

    const newPlayer = new WaitingPlayer();
    return new Success({
      waitingRoom: new WaitingRoom({
        ...this,
        secret: this.secret,
        players: [...this.players, newPlayer],
      }),
      newPlayer,
    });
  }

  /** 待合室からプレイヤーが退出した後のオブジェクトを得る。 */
  public toLeft(param: {
    /** 退出するプレイヤーのID。 */
    readonly playerId: WaitingPlayer['id'];
    /** 退出するプレイヤーに対する操作を許可するコンテキストオブジェクト。 */
    readonly context: PlayerContext;
  }): TResult<
    {
      /** プレイヤーが退出した後の待合室のオブジェクト。 */
      waitingRoom: WaitingRoom;
    },
    IllegalContextException
  > {
    if (param.context.playerId !== param.playerId) {
      return new Failure(new IllegalContextException());
    }
    return new Success({
      waitingRoom: new WaitingRoom({
        ...this,
        secret: this.secret,
        players: this.players.filter((exists) => exists.id !== param.playerId),
      }),
    });
  }

  /** 待合室からプレイヤーをキックした後のオブジェクトを得る。 */
  public toKicked(param: {
    /** キックされるプレイヤーのID。 */
    readonly targetId: WaitingPlayer['id'];
    /** この待合室に対するオーナーとしての操作を許可するコンテキストオブジェクト。 */
    readonly context: WaitingRoomOwnerContext;
  }): TResult<
    {
      /** プレイヤーがキックされた後の待合室のオブジェクト。 */
      waitingRoom: WaitingRoom;
    },
    IllegalContextException
  > {
    if (param.context.waitingRoomId !== this.id) {
      return new Failure(new IllegalContextException());
    }

    return new Success({
      waitingRoom: new WaitingRoom({
        ...this,
        secret: this.secret,
        players: this.players.filter((exists) => exists.id !== param.targetId),
      }),
    });
  }

  public dangerouslyGetSecret(): WaitingRoom['secret'] {
    return this.secret;
  }
}

export class InvalidSecretException extends ApplicationErrorOrException {
  public readonly name = 'InvalidSecretException';
}

export class MaxPlayerCountExceededException extends ApplicationErrorOrException {
  public readonly name = 'MaxPlayerCountExceededException';
}

class WaitingPlayer implements IWaitingPlayer {
  public readonly [waitingPlayerTypeSymbol]: unknown;
  public readonly id;
  private readonly secret: TLongSecret;

  public constructor() {
    this.id = generateId() as IWaitingPlayer['id'];
    this.secret = generateLongSecret();
  }

  public dangerouslyGetAuthenticationToken() {
    return this.secret;
  }
}
