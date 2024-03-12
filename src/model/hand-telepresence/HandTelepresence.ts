import { TDtoOf } from '../../utils/dto-of/TDtoOf.ts';
import { TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import { TId } from '../../utils/random-values/TId.ts';
import { TLongSecret, generateLongSecret } from '../../utils/random-values/TLongSecret.ts';
import { Failure, Success, TResult } from '../../utils/result/TResult.ts';
import { IllegalContextException } from '../errors/IllegalContextException.ts';
import { IllegalParamException } from '../errors/IllegalParamException.ts';
import { playerTypeSymbol } from '../player/Player.ts';
import { ICard } from '../values/ICard.ts';
import { HandTelepresenceContext } from './HandTelepresenceContext.ts';

export const handTelepresenceTypeSymbol = Symbol();

/** 手札を抜き取られる側のプレイヤーの手札の様子を、手札を抜き取る側と抜き取られる側とで共有するためのエンティティクラス。 */
export class HandTelepresence {
  public readonly [handTelepresenceTypeSymbol]: unknown;

  /** プレイヤーのID。 */
  public readonly id: TNominalPrimitive<TId, typeof playerTypeSymbol>;

  /** 見られている手札の番号 */
  public readonly lookingAt: number;

  /** 認証トークン。 */
  private readonly authenticationToken: TLongSecret;

  /** 各手札の位置等の状態の一覧。 */
  private readonly cards: Readonly<CardState[]>;

  //#region コンストラクタ他
  private constructor(
    param: Omit<TDtoOf<HandTelepresence>, typeof handTelepresenceTypeSymbol> & {
      cards: HandTelepresence['cards'];
      authenticationToken: HandTelepresence['authenticationToken'];
    },
  ) {
    this.id = param.id;
    this.lookingAt = param.lookingAt;
    this.authenticationToken = param.authenticationToken;
    this.cards = param.cards;
  }

  public static fromDto(
    param: Omit<TDtoOf<HandTelepresence>, typeof handTelepresenceTypeSymbol> & {
      cards: HandTelepresence['cards'];
      authenticationToken: HandTelepresence['authenticationToken'];
    },
  ): HandTelepresence {
    return new HandTelepresence(param);
  }
  //#endregion

  /** プレイヤーの手札の様子を表す手札テレプレゼンスのオブジェクトを作成する。 */
  public static create(
    param: Pick<TDtoOf<HandTelepresence>, 'id'> & {
      /** 各手札の位置等の状態の一覧。 */
      readonly cards: HandTelepresence['cards'];
    },
  ): Success<{
    /** 作成された手札テレプレゼンスのオブジェクト。 */
    sharedHand: HandTelepresence;
  }> {
    return new Success({
      sharedHand: new HandTelepresence({
        id: param.id,
        lookingAt: 0,
        authenticationToken: generateLongSecret(),
        cards: [...param.cards].sort(),
      }),
    });
  }

  /** 指定されたカードをこすっている時の手札テレプレゼンスのオブジェクトを返す。 */
  public toScrubbing(param: {
    /** こするカードの番号。 */
    readonly index: number;
    /** この手札テレプレゼンスに対する操作を許可するコンテキストオブジェクト。 */
    readonly context: HandTelepresenceContext;
  }): Success<{
    /** 指定されたカードをこすっている時の手札テレプレゼンスのオブジェクト。 */
    sharedHand: HandTelepresence;
  }> {
    if (param.context.sharedHandId !== this.id) {
      throw new IllegalContextException();
    }
    return new Success({
      sharedHand: new HandTelepresence({
        ...this,
        cards: this.cards.map((card, index) => {
          // 押さえられているかによってずれ具合が変わる。
          const result = card.toPositionSet({
            x: card.x + (card.isHolded ? 0.01 : 0.02),
            y: card.y,
          });
          return index === param.index && result instanceof Success ? result.value : card;
        }),
      }),
    });
  }

  /** 指定されたカードの辺りを見回している時の手札テレプレゼンスのオブジェクトを返す。 */
  public toLooking(param: {
    /** 見回すカードの番号。 */
    readonly index: number;
    /** この手札テレプレゼンスに対する操作を許可するコンテキストオブジェクト。 */
    readonly context: HandTelepresenceContext;
  }): TResult<
    {
      /** 指定されたカードの辺りを見回している時の手札テレプレゼンスのオブジェクト。 */
      sharedHand: HandTelepresence;
    },
    IllegalParamException
  > {
    if (param.context.sharedHandId !== this.id) {
      throw new IllegalContextException();
    }
    if (!Number.isInteger(param.index) || this.cards.length - 1 < param.index) {
      return new Failure(new IllegalParamException('存在しないカードを見ようとしています。'));
    }
    return new Success({
      sharedHand: new HandTelepresence({
        ...this,
        cards: this.cards,
        lookingAt: param.index,
      }),
    });
  }

  /** 指定されたカードを押さえている時の手札テレプレゼンスのオブジェクトを返す。 */
  public toHolding(param: {
    /** 押さえるカードの番号。 */
    readonly indexes: Readonly<number[]>;
    /** この手札テレプレゼンスに対する操作を許可するコンテキストオブジェクト。 */
    readonly context: HandTelepresenceContext;
  }): Success<{
    /** 指定されたカードを押さえている時の手札テレプレゼンスのオブジェクト。 */
    sharedHand: HandTelepresence;
  }> {
    if (param.context.sharedHandId !== this.id) {
      throw new IllegalContextException();
    }
    return new Success({
      sharedHand: new HandTelepresence({
        ...this,
        cards: this.cards.map((card, index) =>
          param.indexes.includes(index) ? card.toHolded() : card.toUnholded(),
        ),
      }),
    });
  }

  /** 指定されたカードを持ち上げている時の手札テレプレゼンスのオブジェクトを返す。 */
  public toPicking(param: {
    /** 持ち上げるカードの番号。 */
    readonly index: number;
    /** 持ち上げる量。 */
    readonly amount: number;
    /** この手札テレプレゼンスに対する操作を許可するコンテキストオブジェクト。 */
    readonly context: HandTelepresenceContext;
  }): Success<{
    /** 指定されたカードを持ち上げている時の手札テレプレゼンスのオブジェクト。 */
    sharedHand: HandTelepresence;
  }> {
    if (param.context.sharedHandId !== this.id) {
      throw new IllegalContextException();
    }
    return new Success({
      sharedHand: new HandTelepresence({
        ...this,
        cards: this.cards.map((card, index) => {
          const result = card.toDistanceFromInitialPositionSet({
            // 押さえられているかによって持ち上がり具合が変わる。
            distanceFromInitialPosition:
              (param.amount - card.distanceFromInitialPosition) / (card.isHolded ? 2 : 1) +
              card.distanceFromInitialPosition,
          });
          return index === param.index && result instanceof Success ? result.value : card;
        }),
      }),
    });
  }

  public dangerouslyGetAuthenticationToken(): TLongSecret {
    return this.authenticationToken;
  }
}

/** 1枚のカードの状態を表すクラス。 */
class CardState {
  /** そのカードの種類。 */
  public readonly card: ICard;

  /**
   * そのカードのX座標。
   * 0以上1以下。
   */
  public readonly x: number;

  /**
   * そのカードのY座標。
   * 0以上1以下。
   */
  public readonly y: number;

  /**
   * そのカードの持ち上がり具合。
   * 1になるとカードが完全に離れたことを意味する。
   * 0以上1以下。
   */
  public readonly distanceFromInitialPosition: number;

  /** そのカードが押さえられているかどうか。 */
  public readonly isHolded: boolean;

  //#region コンストラクタ他
  private constructor(param: TDtoOf<CardState>) {
    this.card = param.card;
    this.x = param.x;
    this.y = param.y;
    this.distanceFromInitialPosition = param.distanceFromInitialPosition;
    this.isHolded = param.isHolded;
  }

  public static fromDto(param: TDtoOf<CardState>): CardState {
    return new CardState(param);
  }
  //#endregion

  /** 1枚のカードの状態を表すオブジェクトを作成する。 */
  public static create(param: Pick<TDtoOf<CardState>, 'card' | 'x' | 'y'>): TResult<
    {
      /** 1枚のカードの状態を表すオブジェクト。 */
      cardState: CardState;
    },
    IllegalParamException
  > {
    if (param.x < 0 || 1 < param.x || param.y < 0 || 1 < param.y) {
      return new Failure(
        new IllegalParamException('手札のX座標およびY座標は0以上1以下である必要があります。'),
      );
    }
    return new Success({
      cardState: new CardState({ ...param, distanceFromInitialPosition: 0, isHolded: false }),
    });
  }

  /** カードの座標を変更した後のカードの状態を表すオブジェクトを返す。 */
  public toPositionSet(param: {
    /** 変更後のカードのX座標。 */
    readonly x: number;
    /** 変更後のカードのY座標。 */
    readonly y: number;
  }): TResult<
    {
      /** カードの座標を変更した後のカードの状態を表すオブジェクト。 */
      cardState: CardState;
    },
    IllegalParamException
  > {
    if (param.x < 0 || 1 < param.x || param.y < 0 || 1 < param.y) {
      return new Failure(
        new IllegalParamException('手札のX座標およびY座標は0以上1以下である必要があります。'),
      );
    }
    return new Success({ cardState: new CardState({ ...this, x: param.x, y: param.y }) });
  }

  /** カードの持ち上がり具合を変更した後のカードの状態を表すオブジェクトを返す。 */
  public toDistanceFromInitialPositionSet(param: {
    /** 変更後のカードの持ち上がり具合。 */
    readonly distanceFromInitialPosition: number;
  }): TResult<
    {
      /** カードの持ち上がり具合を変更した後のカードの状態を表すオブジェクト。 */
      cardState: CardState;
    },
    IllegalParamException
  > {
    if (param.distanceFromInitialPosition < 0 || 1 < param.distanceFromInitialPosition) {
      return new Failure(
        new IllegalParamException('カードの持ち上がり具合は0以上1以下である必要があります。'),
      );
    }
    return new Success({
      cardState: new CardState({
        ...this,
        distanceFromInitialPosition: param.distanceFromInitialPosition,
      }),
    });
  }

  /** カードを押さえている時のカードの状態を表すオブジェクトを返す。 */
  public toHolded(): Success<{ cardState: CardState }> {
    return new Success({ cardState: new CardState({ ...this, isHolded: true }) });
  }

  /** カードを押さえていない時のカードの状態を表すオブジェクトを返す。 */
  public toUnholded(): Success<{ cardState: CardState }> {
    return new Success({ cardState: new CardState({ ...this, isHolded: false }) });
  }
}
