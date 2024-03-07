import { TDtoOf } from '../../utils/dto-of/TDtoOf.ts';
import { TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import { TId, generateId } from '../../utils/random-values/TId.ts';
import { Failure, Success, TResult } from '../../utils/result/TResult.ts';
import { IllegalParamException } from '../errors/IllegalParamException.ts';
import { Player } from './Player.ts';
import { Table } from './Table.ts';

const symbol = Symbol();

/**
 * ババ抜きの競技1回とその状態を表現するエンティティクラス。
 */
export class Game {
  public readonly __brand = symbol;

  /**
   * 競技のID。
   */
  public readonly id: TNominalPrimitive<TId, symbol>;

  /**
   * 競技に参加しているプレイヤーの一覧。
   */
  public readonly players: Readonly<Player[]>;

  /**
   * 場（カードを捨てる場所）。
   */
  public readonly table: Table;

  //#region コンストラクタ他
  private constructor(param: Omit<TDtoOf<Game>, '__brand'>) {
    this.id = param.id;
    this.players = param.players;
    this.table = param.table;
  }

  public static fromDto(param: Omit<TDtoOf<Game>, '__brand'>) {
    return new Game(param);
  }
  //#endregion

  /**
   * 競技のオブジェクトを作成する。
   */
  public static create(param: {
    /**
     * 競技に参加する人数。
     */
    playerCount: number;
  }): TResult<Game, IllegalParamException> {
    const createPlayersResult = Player.createManyForOneGame({ count: param.playerCount });
    if (createPlayersResult instanceof Failure) {
      return new Failure(createPlayersResult.value);
    }

    const id = generateId();

    return new Success(
      new Game({
        id,
        players: createPlayersResult.value.players,
        table: Table.create({ id }).value.table,
      }),
    );
  }
}
