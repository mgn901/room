import { type TParameterize } from '../../utils/dto-of/TParameterize.ts';
import { Failure, Success, type TResult } from '../../utils/result/TResult.ts';
import { IllegalParamException } from '../errors/IllegalParamException.ts';
import { type ICard } from '../values/ICard.ts';

/** 1枚のカードの状態を表すクラス。 */
export class CardState {
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
  private constructor(param: TParameterize<CardState>) {
    this.card = param.card;
    this.x = param.x;
    this.y = param.y;
    this.distanceFromInitialPosition = param.distanceFromInitialPosition;
    this.isHolded = param.isHolded;
  }

  public static fromDto(param: TParameterize<CardState>): CardState {
    return new CardState(param);
  }
  //#endregion
  /** 1枚のカードの状態を表すオブジェクトを作成する。 */
  public static create(param: Pick<TParameterize<CardState>, 'card' | 'x' | 'y'>): TResult<
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
