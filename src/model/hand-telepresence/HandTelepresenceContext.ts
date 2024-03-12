import { type TParameterize } from '../../utils/dto-of/TParameterize.ts';
import { Failure, Success, type TResult } from '../../utils/result/TResult.ts';
import { IllegalAuthenticationTokenException } from '../player/PlayerContext.ts';
import { type HandTelepresence } from './HandTelepresence.ts';

export const handTelepresenceContextTypeSymbol = Symbol();

/** 特定の手札テレプレゼンスの操作を行えるコンテキストにあることを表すオブジェクト。 */
export class HandTelepresenceContext {
  public readonly [handTelepresenceContextTypeSymbol]: unknown;

  /** このコンテキストオブジェクトでの操作が許可されている手札テレプレゼンスのID。 */
  public readonly sharedHandId: HandTelepresence['id'];

  private constructor(param: TParameterize<HandTelepresenceContext>) {
    this.sharedHandId = param.sharedHandId;
  }

  public static create(param: {
    /** 操作したい手札テレプレゼンスのオブジェクト。 */
    readonly target: HandTelepresence;
    /** 手札テレプレゼンスの認証トークン。 */
    readonly authenticationToken: ReturnType<HandTelepresence['dangerouslyGetAuthenticationToken']>;
  }): TResult<{ context: HandTelepresenceContext }, IllegalAuthenticationTokenException> {
    if (param.authenticationToken !== param.target.dangerouslyGetAuthenticationToken()) {
      return new Failure(new IllegalAuthenticationTokenException('認証トークンに誤りがあります。'));
    }

    return new Success({ context: new HandTelepresenceContext({ sharedHandId: param.target.id }) });
  }
}
