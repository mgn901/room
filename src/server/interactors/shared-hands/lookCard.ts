import { type IllegalParamException } from '../../../model/errors/IllegalParamException.ts';
import { type HandTelepresence } from '../../../model/hand-telepresence/HandTelepresence.ts';
import { HandTelepresenceContext } from '../../../model/hand-telepresence/HandTelepresenceContext.ts';
import { type IllegalAuthenticationTokenException } from '../../../model/player/PlayerContext.ts';
import { type TLongSecret } from '../../../utils/random-values/TLongSecret.ts';
import { Failure, Success, type TResult } from '../../../utils/result/TResult.ts';
import { NotFoundException } from '../../errors/NotFoundException.ts';
import { type IImplementationContainer } from '../../implementation-containers/IImplementationContainer.ts';
import { type RepositoryError } from '../../repositories/RepositoryError.ts';

export const lookCard = (param: {
  readonly handTelepresenceId: HandTelepresence['id'];
  readonly index: number;
  readonly authenticationToken: TLongSecret;
  readonly implementationContainer: IImplementationContainer;
}): TResult<
  { handTelepresence: HandTelepresence },
  IllegalParamException | NotFoundException | IllegalAuthenticationTokenException | RepositoryError
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

  const lookResult = findResult.value.toLooking({
    index: param.index,
    context: createContextResult.value.context,
  });

  if (lookResult instanceof Failure) {
    return lookResult;
  }

  const saveResult = param.implementationContainer.handTelepresenceRepository.save(
    lookResult.value.sharedHand,
  );
  if (saveResult instanceof Failure) {
    return saveResult;
  }

  return new Success({ handTelepresence: lookResult.value.sharedHand });
};
