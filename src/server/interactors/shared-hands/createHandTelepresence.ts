import { type IllegalParamException } from '../../../model/errors/IllegalParamException.ts';
import { CardState } from '../../../model/hand-telepresence/CardState.ts';
import { HandTelepresence } from '../../../model/hand-telepresence/HandTelepresence.ts';
import { type Player } from '../../../model/player/Player.ts';
import { type TDtoOf } from '../../../utils/dto-of/TDtoOf.ts';
import { Failure, Success, type TResult } from '../../../utils/result/TResult.ts';
import { NotFoundException } from '../../errors/NotFoundException.ts';
import { type IImplementationContainer } from '../../implementation-containers/IImplementationContainer.ts';
import { type RepositoryError } from '../../repositories/RepositoryError.ts';

export const createHandTelepresence = (param: {
  readonly playerId: Player['id'];
  readonly cards: Pick<TDtoOf<CardState>, 'card' | 'x' | 'y'>[];
  readonly implementationContainer: IImplementationContainer;
}): TResult<
  { handTelepresence: HandTelepresence },
  IllegalParamException | NotFoundException | RepositoryError
> => {
  const findPlayerResult = param.implementationContainer.playerRepository.findById(param.playerId);
  if (findPlayerResult instanceof Failure) {
    return findPlayerResult;
  }
  if (findPlayerResult.value === undefined) {
    return new Failure(new NotFoundException('指定されたIDのプレイヤーは見つかりません。'));
  }

  const createCardResults = param.cards.map((cardDto) => CardState.create(cardDto));
  for (const result of createCardResults) {
    if (result instanceof Failure) {
      return result;
    }
  }
  const cards = createCardResults
    .filter((result): result is Success<{ cardState: CardState }> => result instanceof Success)
    .map((result) => result.value.cardState);

  const createHandTelepresenceResult = HandTelepresence.create({
    id: param.playerId,
    cards,
  });

  return new Success({ handTelepresence: createHandTelepresenceResult.value.sharedHand });
};
