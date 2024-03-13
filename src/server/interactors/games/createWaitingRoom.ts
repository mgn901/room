import { IWaitingPlayer } from '../../../model/game/IWaitingPlayer.ts';
import { WaitingRoom } from '../../../model/game/WaitingRoom.ts';
import { Failure, Success, type TResult } from '../../../utils/result/TResult.ts';
import { type IImplementationContainer } from '../../implementation-containers/IImplementationContainer.ts';
import { type RepositoryError } from '../../repositories/RepositoryError.ts';

export const createWaitingRoom = (param: {
  readonly implementationContainer: IImplementationContainer;
}): TResult<{ waitingRoom: WaitingRoom; waitingPlayer: IWaitingPlayer }, RepositoryError> => {
  const waitingRoom = WaitingRoom.create().value.waitingRoom;

  const saveResult = param.implementationContainer.waitingRoomRepository.save(waitingRoom);
  if (saveResult instanceof Failure) {
    return saveResult;
  }

  return new Success({ waitingRoom, waitingPlayer: waitingRoom.players[0] });
};
