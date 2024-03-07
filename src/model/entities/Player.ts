import { TDtoOf } from '../../utils/dto-of/TDtoOf.ts';
import { TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import { TId, generateId } from '../../utils/random-values/TId.ts';
import { range } from '../../utils/range/range.ts';
import { Failure, Success, TResult } from '../../utils/result/TResult.ts';
import { except } from '../../utils/set-operations/except.ts';
import { ApplicationErrorOrException } from '../errors/ApplicationErrorOrException.ts';
import { IllegalParamException } from '../errors/IllegalParamException.ts';
import { ICard, compareCard } from './ICard.ts';

const symbol = Symbol();

/**
 * プレイヤーを表すエンティティクラス。
 */
export class Player {
  public readonly __brand = symbol;

  /**
   * プレイヤーのID。
   */
  public readonly id: TNominalPrimitive<TId, symbol>;

  /**
   * 手札の一覧。
   */
  public readonly cardsInHand: Readonly<ICard[]>;

  /**
   * 自分の次にアクションをするプレイヤー。
   * つまり、自分がそのプレイヤーの手札を抜き取る。
   */
  public readonly playerIdOnNext: Player['id'];

  /**
   * 自分の前にアクションをするプレイヤー。
   * つまり、そのプレイヤーが自分の手札を抜き取る。
   */
  public readonly playerIdOnPrev: Player['id'];

  //#region コンストラクタ他
  private constructor(param: Omit<TDtoOf<Player>, '__brand'>) {
    this.id = param.id;
    this.cardsInHand = param.cardsInHand;
    this.playerIdOnNext = param.playerIdOnNext;
    this.playerIdOnPrev = param.playerIdOnPrev;
  }

  public static fromDto(param: Omit<TDtoOf<Player>, '__brand'>) {
    return new Player(param);
  }
  //#endregion

  /**
   * 1回の競技に参加する複数のプレイヤーのオブジェクトを作成する。
   * シャッフルされた山札を分け、プレイヤーが行動する順番を決定する。
   */
  public static createManyForOneGame(param: {
    /**
     * 競技に参加するプレイヤーの人数
     */
    count: number;
  }): TResult<
    {
      /**
       * 競技に参加するプレイヤーのオブジェクトの一覧。
       */
      players: Player[];
    },
    IllegalParamException
  > {
    if (!Number.isInteger(param.count) || (param.count < 2 && 12 < param.count)) {
      return new Failure(new IllegalParamException('2以上12以下の整数を指定してください。'));
    }

    // シャッフルされた山札
    const stock = new StockOfCards();
    const initialStockLength = stock.length;

    // プレイヤーのIDを先に生成しておく。
    const playerIds = range(0, param.count).map(() => generateId());

    const players = playerIds.map(
      (id, idx) =>
        new Player({
          id,
          // 全カードの枚数をプレイヤーの数で割り、余った場合は剰余を1枚ずつ分ける。
          cardsInHand: stock.pop(
            Math.floor(initialStockLength / param.count) +
              (initialStockLength % param.count > idx ? 1 : 0),
          ),
          // 最初に行動するプレイヤーの前のプレイヤーは、最後に行動するプレイヤー。
          playerIdOnPrev: idx === 0 ? playerIds[playerIds.length - 1] : playerIds[idx - 1],
          // 最後に行動するプレイヤーの後ろのプレイヤーは、最初に行動するプレイヤー。
          playerIdOnNext: idx === playerIds.length - 1 ? playerIds[0] : playerIds[idx + 1],
        }),
    );

    return new Success({ players });
  }

  /**
   * 行動（隣のプレイヤーの手札を抜き取る）の後の自分および相手のプレイヤーのオブジェクトを取得する。
   */
  public toActionProceeded(param: {
    /**
     * 隣のプレイヤーのオブジェクト。
     */
    playerOnNext: Player;

    /**
     * 抜き取る相手の手札の番号。
     */
    index: number;
  }): TResult<
    {
      /**
       * 隣のプレイヤーから抜き取った手札を自分の手札に追加した後の自分を表すオブジェクト。
       */
      me: Player;

      /**
       * 自分が手札を抜き取った後の隣のプレイヤーを表すオブジェクト。
       */
      next: Player;
    },
    IllegalActException
  > {
    if (param.playerOnNext.id !== this.playerIdOnNext) {
      return new Failure(
        new IllegalActException('左隣のプレイヤー以外の手札を抜き取ることはできません。'),
      );
    }

    if (param.playerOnNext.cardsInHand.length <= param.index) {
      return new Failure(new IllegalActException('存在しない手札を抜き取ることはできません。'));
    }

    return new Success({
      me: new Player({
        ...this,
        cardsInHand: [...this.cardsInHand, param.playerOnNext.cardsInHand[param.index]],
      }),
      next: new Player({
        ...param.playerOnNext,
        cardsInHand: [
          ...this.cardsInHand.slice(0, param.index),
          ...this.cardsInHand.slice(param.index + 1),
        ],
      }),
    });
  }

  /**
   * 手札に含まれる同位の札を捨てた後の自分のオブジェクトおよび捨てられた手札を取得する。
   */
  public toDiscardPairProceeded(): Success<{
    /**
     * 同位の札を捨てた後の自分のオブジェクト。
     */
    me: Player;

    /**
     * 捨てられた手札の一覧。
     */
    discarded: ICard[];
  }> {
    const newCardsInHand = [...this.cardsInHand]
      .sort(compareCard)
      .reduce<ICard[]>((result, current) => {
        if (result.length === 0) {
          return [current];
        }
        // 新しい手札の一覧の最後の手札と今読んでいる手札が同位の場合は、新しい手札の一覧から最後の手札を捨てる。
        if (result[result.length - 1].rank === current.rank) {
          return result.slice(0, -1);
        }
        // そうでない場合は何もしない。
        result.push(current);
        return result;
      }, []);
    return new Success({
      me: new Player({ ...this, cardsInHand: newCardsInHand }),
      discarded: except(this.cardsInHand, newCardsInHand),
    });
  }
}

export class IllegalActException extends ApplicationErrorOrException {
  public readonly name = 'IllegalActException';
}

/**
 * 山札。
 */
class StockOfCards {
  private readonly cards: ICard[];

  public constructor() {
    this.cards = [
      { suit: 'joker', rank: 'joker' },
      { suit: 'joker', rank: 'joker' },
      ...(['spade', 'heart', 'club', 'diamond'] satisfies ICard['suit'][]).flatMap((suit) =>
        (
          [
            'a',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            'j',
            'q',
            'k',
          ] satisfies ICard['rank'][]
        ).map((rank) => ({ suit, rank })),
      ),
    ];
  }

  /**
   * 山札の残り枚数を数える。
   */
  public get length(): number {
    return this.cards.length;
  }

  /**
   * 山札からカードを取る。
   * @param count 取るカードの枚数。
   * @returns 取ったカードの一覧。
   */
  public pop(count: number): ICard[] {
    if (this.cards.length === 0) {
      throw new EmptyStockOfCardsException('山札のカードは無くなりました。');
    }
    const index = Math.floor(Math.random() * (this.cards.length + 1));
    return this.cards.splice(index, count);
  }
}

class EmptyStockOfCardsException extends ApplicationErrorOrException {
  public readonly name = 'EmptyStockOfCardsException';
}
