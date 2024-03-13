import { type TParameterize } from '../../utils/dto-of/TParameterize.ts';
import { type TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import { type TId } from '../../utils/random-values/TId.ts';
import { Failure, Success, type TResult } from '../../utils/result/TResult.ts';
import { ApplicationErrorOrException } from '../errors/ApplicationErrorOrException.ts';
import { IllegalContextException } from '../errors/IllegalContextException.ts';
import { IllegalParamException } from '../errors/IllegalParamException.ts';
import { Player } from '../player/Player.ts';
import { PlayerContext } from '../player/PlayerContext.ts';
import { type GamePlayerContext } from './GamePlayerContext.ts';
import { Table } from './Table.ts';
import { type WaitingRoom } from './WaitingRoom.ts';

export const gameTypeSymbol = Symbol();

/** ババ抜きの競技1回とその状態を表現するエンティティクラス。 */
export class Game {
  public readonly [gameTypeSymbol]: unknown;

  /** 競技のID。 */
  public readonly id: TNominalPrimitive<TId, typeof gameTypeSymbol>;

  /** 競技に参加しているプレイヤーの一覧。 */
  public readonly players: Readonly<Player[]>;

  /** 上がったプレイヤーの一覧。 */
  public readonly winners: Readonly<Player['id'][]>;

  public readonly playerIdProceeding: Player['id'];

  public readonly playerIdProceeded: Player['id'];

  /** 場（カードを捨てる場所）。 */
  public readonly table: Table;

  //#region コンストラクタ他
  private constructor(param: TParameterize<Game>) {
    this.id = param.id;
    this.players = param.players;
    this.winners = param.winners;
    this.playerIdProceeding = param.playerIdProceeding;
    this.playerIdProceeded = param.playerIdProceeded;
    this.table = param.table;
  }

  public static fromDto(param: TParameterize<Game>): Game {
    return new Game(param);
  }
  //#endregion

  /** 競技のオブジェクトを作成する。 */
  public static create(param: {
    /** 作成元となる待合室のオブジェクト。 */
    readonly waitingRoom: WaitingRoom;
  }): TResult<
    {
      /** 作成された競技のオブジェクト。 */
      game: Game;
    },
    IllegalParamException
  > {
    const createPlayersResult = Player.createManyForOneGame({
      waitingPlayers: param.waitingRoom.players,
    });
    if (createPlayersResult instanceof Failure) {
      return new Failure(createPlayersResult.value);
    }

    return new Success({
      game: new Game({
        id: param.waitingRoom.id,
        players: createPlayersResult.value.players,
        winners: [],
        playerIdProceeding: createPlayersResult.value.players[0].id,
        playerIdProceeded: createPlayersResult.value.players[1].id,
        table: Table.create({ id: param.waitingRoom.id }).value.table,
      }),
    });
  }

  public toWinnerAdded(param: {
    player: Player;
    context: GamePlayerContext;
  }): TResult<{ game: Game }, IllegalParamException> {
    if (param.context.gameId !== this.id) {
      throw new IllegalContextException();
    }

    if (param.player.cardsInHand.length !== 0) {
      return new Failure(new IllegalParamException('手札が残った状態で上がることはできません。'));
    }

    if (this.winners.includes(param.player.id)) {
      return new Success({ game: this });
    }

    return new Success({
      game: new Game({ ...this, winners: [...this.winners, param.player.id] }),
    });
  }

  public toTurnChanged(param: {
    context: PlayerContext;
  }): TResult<
    {
      game: Game;
    },
    IllegalTurnChangeExeption
  > {
    if (param.context.playerId !== this.playerIdProceeding) {
      return new Failure(
        new IllegalTurnChangeExeption('他のプレイヤーが行動の終了を宣言することはできません。'),
      );
    }

    return new Success({
      game: new Game({
        ...this,
        playerIdProceeding: this.playerIdProceeded,
        playerIdProceeded: this.players.find((player) => player.id === this.playerIdProceeded)
          ?.playerIdOnNext,
      }),
    });
  }

  public toTableSet(param: {
    table: Table;
    context: GamePlayerContext;
  }): Success<{
    game: Game;
  }> {
    if (param.context.gameId !== this.id) {
      throw new IllegalContextException();
    }
    return new Success({ game: new Game({ ...this, table: param.table }) });
  }
}

export class IllegalTurnChangeExeption extends ApplicationErrorOrException {
  public readonly name = 'IllegalTurnChangeExeption';
}
