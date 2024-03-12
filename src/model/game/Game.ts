import { TDtoOf } from '../../utils/dto-of/TDtoOf.ts';
import { TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import { TId } from '../../utils/random-values/TId.ts';
import { Failure, Success, TResult } from '../../utils/result/TResult.ts';
import { IllegalContextException } from '../errors/IllegalContextException.ts';
import { IllegalParamException } from '../errors/IllegalParamException.ts';
import { Player } from '../player/Player.ts';
import { GamePlayerContext } from './GamePlayerContext.ts';
import { Table } from './Table.ts';
import { WaitingRoom } from './WaitingRoom.ts';

export const gameTypeSymbol = Symbol();

/** ババ抜きの競技1回とその状態を表現するエンティティクラス。 */
export class Game {
  public readonly [gameTypeSymbol]: unknown;

  /** 競技のID。 */
  public readonly id: TNominalPrimitive<TId, typeof gameTypeSymbol>;

  /** 競技に参加しているプレイヤーの一覧。 */
  public readonly players: Readonly<Player[]>;

  /** 場（カードを捨てる場所）。 */
  public readonly table: Table;

  //#region コンストラクタ他
  private constructor(param: Omit<TDtoOf<Game>, typeof gameTypeSymbol>) {
    this.id = param.id;
    this.players = param.players;
    this.table = param.table;
  }

  public static fromDto(param: Omit<TDtoOf<Game>, typeof gameTypeSymbol>): Game {
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
        table: Table.create({ id: param.waitingRoom.id }).value.table,
      }),
    });
  }

  public toTableSet(param: {
    table: Table;
    context: GamePlayerContext;
  }): Success<{ game: Game }> {
    if (param.context.gameId !== this.id) {
      throw new IllegalContextException();
    }
    return new Success({ game: new Game({ ...this, table: param.table }) });
  }
}
