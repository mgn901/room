import { type HandTelepresence } from '../../../model/hand-telepresence/HandTelepresence.ts';
import { HandTelepresenceContext } from '../../../model/hand-telepresence/HandTelepresenceContext.ts';
import { type IllegalAuthenticationTokenException } from '../../../model/player/PlayerContext.ts';
import { type TLongSecret } from '../../../utils/random-values/TLongSecret.ts';
import { Failure, Success, type TResult } from '../../../utils/result/TResult.ts';
import { NotFoundException } from '../../errors/NotFoundException.ts';
import { type IImplementationContainer } from '../../implementation-containers/IImplementationContainer.ts';
import { type RepositoryError } from '../../repositories/RepositoryError.ts';

export const holdCard = (param: {
  readonly handTelepresenceId: HandTelepresence['id'];
  readonly indexes: Readonly<number[]>;
  readonly authenticationToken: TLongSecret;
  readonly implementationContainer: IImplementationContainer;
}): TResult<
  { handTelepresence: HandTelepresence },
  NotFoundException | IllegalAuthenticationTokenException | RepositoryError
> => {
  const findResult = param.implementationContainer.handTelepresenceRepository.findById(
    param.handTelepresenceId,
  );
  if (findResult instanceof Failure) {
    return findResult;
  }
  if (findResult.value === undefined) {
    return new Failure(new NotFoundException('指定されたIDの手札テレプレゼンスは見つかりません。'));
  }

  const createContextResult = HandTelepresenceContext.create({
    authenticationToken: param.authenticationToken,
    target: findResult.value,
  });
  if (createContextResult instanceof Failure) {
    return createContextResult;
  }

  const holdResult = findResult.value.toHolding({
    indexes: param.indexes,
    context: createContextResult.value.context,
  });

  const saveResult = param.implementationContainer.handTelepresenceRepository.save(
    holdResult.value.sharedHand,
  );
  if (saveResult instanceof Failure) {
    return saveResult;
  }

  return new Success({ handTelepresence: holdResult.value.sharedHand });
};
