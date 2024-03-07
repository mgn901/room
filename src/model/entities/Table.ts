import { TDtoOf } from '../../utils/dto-of/TDtoOf.ts';
import { TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import { TId } from '../../utils/random-values/TId.ts';
import { Success } from '../../utils/result/TResult.ts';
import { Game } from './Game.ts';
import { ICard } from './ICard.ts';

const symbol = Symbol();

/**
 * 場（カードを捨てる場所）を表すエンティティクラス。
 */
export class Table {
  public readonly __brand = symbol;

  /**
   * 場のID。対応する競技と同じIDを持つ。
   */
  public readonly id: TNominalPrimitive<TId, Game['__brand']>;

  /**
   * 場に置かれているカードの一覧。
   */
  public readonly cards: Readonly<ICard[]>;

  //#region コンストラクタ他
  public constructor(param: Omit<TDtoOf<Table>, '__brand'>) {
    this.id = param.id;
    this.cards = param.cards;
  }

  public static fromDto(param: Omit<TDtoOf<Table>, '__brand'>) {
    return new Table(param);
  }
  //#endregion

  /**
   * 場を作成する。
   */
  public static create(param: Pick<Table, 'id'>): Success<{
    /**
     * 作成された場のオブジェクト。
     */
    table: Table;
  }> {
    return new Success({
      table: new Table({
        id: param.id,
        cards: [],
      }),
    });
  }

  /**
   * 場にカードを捨てる。
   */
  public putCards(param: {
    /**
     * 捨てるカードの一覧。
     */
    cards: ICard[];
  }): Success<{
    /**
     * 捨てるカードを置いた後の場のオブジェクト。
     */
    table: Table;
  }> {
    return new Success({
      table: new Table({
        id: this.id,
        cards: [...this.cards, ...param.cards],
      }),
    });
  }
}
