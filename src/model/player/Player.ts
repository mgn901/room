import { type TParameterize } from '../../utils/dto-of/TParameterize.ts';
import { type TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import { type TId } from '../../utils/random-values/TId.ts';
import { type TLongSecret } from '../../utils/random-values/TLongSecret.ts';
import { range } from '../../utils/range/range.ts';
import { Failure, Success, type TResult } from '../../utils/result/TResult.ts';
import { except } from '../../utils/set-operations/except.ts';
import { MAX_PLAYER_COUNT, MIN_PLAYER_COUNT } from '../constants.ts';
import { ApplicationErrorOrException } from '../errors/ApplicationErrorOrException.ts';
import { IllegalContextException } from '../errors/IllegalContextException.ts';
import { IllegalParamException } from '../errors/IllegalParamException.ts';
import { type Game } from '../game/Game.ts';
import { type IWaitingPlayer } from '../game/IWaitingPlayer.ts';
import { type ICard, compareCard } from '../values/ICard.ts';
import { type PlayerContext } from './PlayerContext.ts';

export const playerTypeSymbol = Symbol();

/** プレイヤーを表すエンティティクラス。*/
export class Player {
  public readonly [playerTypeSymbol]: unknown;

  /** プレイヤーのID。*/
  public readonly id: TNominalPrimitive<TId, typeof playerTypeSymbol>;

  /** プレイヤーの認証トークン。 */
  private readonly authenticationToken: TLongSecret;

  /** 手札の一覧。*/
  public readonly cardsInHand: Readonly<ICard[]>;

  //#region コンストラクタ他
  private constructor(
    param: TParameterize<Player> & {
      readonly authenticationToken: Player['authenticationToken'];
    },
  ) {
    this.id = param.id;
    this.authenticationToken = param.authenticationToken;
    this.cardsInHand = param.cardsInHand;
  }

  public static fromDto(
    param: TParameterize<Player> & {
      readonly authenticationToken: Player['authenticationToken'];
    },
  ): Player {
    return new Player(param);
  }
  //#endregion

  /**
   * 1回の競技に参加する複数のプレイヤーのオブジェクトを作成する。
   * シャッフルされた山札を分ける。
   */
  public static createManyForOneGame(param: {
    /** 作成元となる待合室のプレイヤーのオブジェクトの一覧。 */
    readonly waitingPlayers: Readonly<IWaitingPlayer[]>;
  }): TResult<
    {
      /** 競技に参加するプレイヤーのオブジェクトの一覧。 */
      players: Player[];
    },
    IllegalParamException
  > {
    if (
      param.waitingPlayers.length < MIN_PLAYER_COUNT ||
      MAX_PLAYER_COUNT < param.waitingPlayers.length
    ) {
      return new Failure(
        new IllegalParamException(
          `参加するプレイヤーの人数は${MIN_PLAYER_COUNT}人以上${MAX_PLAYER_COUNT}人以下にしてください。`,
        ),
      );
    }

    // シャッフルされた山札
    const stock = new StockOfCards();
    const initialStockLength = stock.length;

    const players = param.waitingPlayers.map(
      (player, idx) =>
        new Player({
          id: player.id,
          authenticationToken: player.dangerouslyGetAuthenticationToken(),
          // 全カードの枚数をプレイヤーの数で割り、余った場合は剰余を1枚ずつ分ける。
          cardsInHand: stock.pop(
            Math.floor(initialStockLength / param.waitingPlayers.length) +
              (initialStockLength % param.waitingPlayers.length > idx ? 1 : 0),
          ),
        }),
    );

    return new Success({ players });
  }

  /** アクション（隣のプレイヤーの手札を抜き取る）の後の自分および相手のプレイヤーのオブジェクトを取得する。 */
  public toActionProceeded(param: {
    /** 参加している競技のオブジェクト。 */
    readonly game: Game;
    /** 隣のプレイヤーのオブジェクト。 */
    readonly playerOnNext: Player;
    /** 抜き取る相手の手札の番号。 */
    readonly index: number;
    /** このプレイヤーに対する操作を許可するコンテキストオブジェクト。 */
    readonly context: PlayerContext;
  }): TResult<
    {
      /** 隣のプレイヤーから抜き取った手札を自分の手札に追加した後の自分を表すオブジェクト。 */
      me: Player;
      /** 自分が手札を抜き取った後の隣のプレイヤーを表すオブジェクト。 */
      next: Player;
    },
    IllegalActException
  > {
    if (param.context.playerId !== this.id) {
      throw new IllegalContextException();
    }

    if (param.playerOnNext.id !== param.game.playerIdProceeded) {
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
        authenticationToken: this.authenticationToken,
        cardsInHand: [...this.cardsInHand, param.playerOnNext.cardsInHand[param.index]],
      }),
      next: new Player({
        ...param.playerOnNext,
        authenticationToken: param.playerOnNext.authenticationToken,
        cardsInHand: [
          ...this.cardsInHand.slice(0, param.index),
          ...this.cardsInHand.slice(param.index + 1),
        ],
      }),
    });
  }

  /** 手札に含まれる同位の札を捨てた後の自分のオブジェクトおよび捨てられた手札を取得する。 */
  public toPairsDiscarded(param: {
    /** このプレイヤーに対する操作を許可するコンテキストオブジェクト。 */
    readonly context: PlayerContext;
  }): Success<{
    /** 同位の札を捨てた後の自分のオブジェクト。 */
    player: Player;
    /** 捨てられた手札の一覧。 */
    discarded: ICard[];
  }> {
    if (param.context.playerId !== this.id) {
      throw new IllegalContextException();
    }

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
      player: new Player({
        ...this,
        authenticationToken: this.authenticationToken,
        cardsInHand: newCardsInHand,
      }),
      discarded: except(this.cardsInHand, newCardsInHand, compareCard),
    });
  }

  public dangerouslyGetAuthenticationToken(): Player['authenticationToken'] {
    return this.authenticationToken;
  }
}

export class IllegalActException extends ApplicationErrorOrException {
  public readonly name = 'IllegalActException';
}

/** 山札を表すクラス。 */
class StockOfCards {
  private readonly cards: ICard[];

  public constructor() {
    this.cards = [
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

  /** 山札の残り枚数。 */
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
    return range(0, count).reduce<ICard[]>((toReturned, current) => {
      const index = Math.floor(Math.random() * this.cards.length);
      if (this.cards.length !== 0) {
        toReturned.push(...this.cards.splice(index, 1));
      }
      return toReturned;
    }, []);
  }
}

class EmptyStockOfCardsException extends ApplicationErrorOrException {
  public readonly name = 'EmptyStockOfCardsException';
}
