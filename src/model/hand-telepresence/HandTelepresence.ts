import { compare } from '../../utils/compare/compare.ts';
import { type TParameterize } from '../../utils/dto-of/TParameterize.ts';
import { type TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import { type TId } from '../../utils/random-values/TId.ts';
import { type TLongSecret, generateLongSecret } from '../../utils/random-values/TLongSecret.ts';
import { Failure, Success, type TResult } from '../../utils/result/TResult.ts';
import { IllegalContextException } from '../errors/IllegalContextException.ts';
import { IllegalParamException } from '../errors/IllegalParamException.ts';
import { type playerTypeSymbol } from '../player/Player.ts';
import { type CardState } from './CardState.ts';
import { type HandTelepresenceContext } from './HandTelepresenceContext.ts';

export const handTelepresenceTypeSymbol = Symbol();

/** 手札を抜き取られる側のプレイヤーの手札の様子を、手札を抜き取る側と抜き取られる側とで共有するためのエンティティクラス。 */
export class HandTelepresence {
  public readonly [handTelepresenceTypeSymbol]: unknown;

  /** プレイヤーのID。 */
  public readonly id: TNominalPrimitive<TId, typeof playerTypeSymbol>;

  /** 見られている手札の番号 */
  public readonly lookingAt: number;

  /** 各手札の位置等の状態の一覧。 */
  public readonly cards: Readonly<CardState[]>;

  /** 認証トークン。 */
  private readonly authenticationToken: TLongSecret;

  //#region コンストラクタ他
  private constructor(
    param: TParameterize<HandTelepresence> & {
      authenticationToken: HandTelepresence['authenticationToken'];
    },
  ) {
    this.id = param.id;
    this.lookingAt = param.lookingAt;
    this.authenticationToken = param.authenticationToken;
    this.cards = param.cards;
  }

  public static fromDto(
    param: TParameterize<HandTelepresence> & {
      authenticationToken: HandTelepresence['authenticationToken'];
    },
  ): HandTelepresence {
    return new HandTelepresence(param);
  }
  //#endregion

  /** プレイヤーの手札の様子を表す手札テレプレゼンスのオブジェクトを作成する。 */
  public static create(param: Pick<TParameterize<HandTelepresence>, 'id' | 'cards'>): Success<{
    /** 作成された手札テレプレゼンスのオブジェクト。 */
    sharedHand: HandTelepresence;
  }> {
    return new Success({
      sharedHand: new HandTelepresence({
        id: param.id,
        lookingAt: 0,
        authenticationToken: generateLongSecret(),
        cards: [...param.cards].sort((a, b) => compare(a.x, b.x)),
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
        authenticationToken: this.authenticationToken,
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
        authenticationToken: this.authenticationToken,
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
        authenticationToken: this.authenticationToken,
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
        authenticationToken: this.authenticationToken,
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
