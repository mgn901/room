import { TDtoOf } from '../../utils/dto-of/TDtoOf.ts';
import { TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import { TId } from '../../utils/random-values/TId.ts';
import { Failure, Success, TResult } from '../../utils/result/TResult.ts';
import { IllegalContextException } from '../errors/IllegalContextException.ts';
import { ICard } from '../values/ICard.ts';
import { gameTypeSymbol } from './Game.ts';
import { GamePlayerContext } from './GamePlayerContext.ts';

export const tableTypeSymbol = Symbol();

/** 場（カードを捨てる場所）を表すエンティティクラス。 */
export class Table {
  public readonly [tableTypeSymbol]: unknown;

  /** 場のID。対応する競技と同じIDを持つ。 */
  public readonly id: TNominalPrimitive<TId, typeof gameTypeSymbol>;

  /** 場に置かれているカードの一覧。 */
  public readonly cards: Readonly<ICard[]>;

  //#region コンストラクタ他
  public constructor(param: Omit<TDtoOf<Table>, typeof tableTypeSymbol>) {
    this.id = param.id;
    this.cards = param.cards;
  }

  public static fromDto(param: Omit<TDtoOf<Table>, typeof tableTypeSymbol>): Table {
    return new Table(param);
  }
  //#endregion

  /** 場のオブジェクトを作成する。 */
  public static create(param: Pick<Table, 'id'>): Success<{
    /** 作成された場のオブジェクト。 */
    table: Table;
  }> {
    return new Success({
      table: new Table({
        id: param.id,
        cards: [],
      }),
    });
  }

  /** 場にカードを捨てる。 */
  public toCardsPut(param: {
    /** 捨てるカードの一覧。 */
    readonly cards: Readonly<ICard[]>;
    /** このゲームに対する操作を許可するコンテキストオブジェクト。 */
    readonly context: GamePlayerContext;
  }): TResult<
    {
      /** 捨てるカードを置いた後の場のオブジェクト。 */
      table: Table;
    },
    IllegalContextException
  > {
    if (param.context.gameId !== this.id) {
      return new Failure(new IllegalContextException());
    }
    return new Success({
      table: new Table({
        id: this.id,
        cards: [...this.cards, ...param.cards],
      }),
    });
  }
}
