import { type IllegalParamException } from '../../../model/errors/IllegalParamException.ts';
import { type Game } from '../../../model/game/Game.ts';
import { CardState } from '../../../model/hand-telepresence/CardState.ts';
import { HandTelepresence } from '../../../model/hand-telepresence/HandTelepresence.ts';
import { type Player } from '../../../model/player/Player.ts';
import { type TParameterize } from '../../../utils/dto-of/TParameterize.ts';
import { Failure, Success, type TResult } from '../../../utils/result/TResult.ts';
import { NotFoundException } from '../../errors/NotFoundException.ts';
import { type IImplementationContainer } from '../../implementation-containers/IImplementationContainer.ts';
import { type RepositoryError } from '../../repositories/RepositoryError.ts';

export const createHandTelepresence = (param: {
  readonly gameId: Game['id'];
  readonly playerId: Player['id'];
  readonly cards: Pick<TParameterize<CardState>, 'card' | 'x' | 'y'>[];
  readonly implementationContainer: IImplementationContainer;
}): TResult<
  { handTelepresence: HandTelepresence; playerIdOnPrev: Player['id'] },
  IllegalParamException | NotFoundException | RepositoryError
> => {
  const findGameResult = param.implementationContainer.gameRepository.findById(param.gameId);
  if (findGameResult instanceof Failure) {
    return findGameResult;
  }
  if (findGameResult.value === undefined) {
    return new Failure(new NotFoundException('指定されたIDの競技は見つかりません。'));
  }

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

  return new Success({
    handTelepresence: createHandTelepresenceResult.value.sharedHand,
    playerIdOnPrev: findGameResult.value.playerIdProceeding,
  });
};
