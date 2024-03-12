import { type IllegalParamException } from '../../../model/errors/IllegalParamException.ts';
import { Game } from '../../../model/game/Game.ts';
import { type WaitingRoom } from '../../../model/game/WaitingRoom.ts';
import { Failure, Success, type TResult } from '../../../utils/result/TResult.ts';
import { NotFoundException } from '../../errors/NotFoundException.ts';
import { type IImplementationContainer } from '../../implementation-containers/IImplementationContainer.ts';
import { type RepositoryError } from '../../repositories/RepositoryError.ts';

export const createGame = (param: {
  readonly waitingRoomId: WaitingRoom['id'];
  readonly implementationContainer: IImplementationContainer;
}): TResult<{ game: Game }, NotFoundException | IllegalParamException | RepositoryError> => {
  const findResult = param.implementationContainer.waitingRoomRepository.findById(
    param.waitingRoomId,
  );
  if (findResult instanceof Failure) {
    return findResult;
  }
  if (findResult.value === undefined) {
    return new Failure(new NotFoundException('指定されたIDの待合室は見つかりません。'));
  }

  const createGameResult = Game.create({ waitingRoom: findResult.value });
  if (createGameResult instanceof Failure) {
    return createGameResult;
  }

  const saveResult = param.implementationContainer.gameRepository.save(createGameResult.value.game);
  if (saveResult instanceof Failure) {
    return saveResult;
  }

  const deleteResult = param.implementationContainer.waitingRoomRepository.delete(
    param.waitingRoomId,
  );
  if (deleteResult instanceof Failure) {
    return deleteResult;
  }

  return new Success({ game: createGameResult.value.game });
};
