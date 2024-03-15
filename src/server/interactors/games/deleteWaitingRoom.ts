import { type WaitingRoom } from '../../../model/game/WaitingRoom.ts';
import { WaitingRoomOwnerContext } from '../../../model/game/WaitingRoomOwnerContext.ts';
import { IllegalAuthenticationTokenException } from '../../../model/player/PlayerContext.ts';
import { type TLongSecret } from '../../../utils/random-values/TLongSecret.ts';
import { Failure, Success, type TResult } from '../../../utils/result/TResult.ts';
import { NotFoundException } from '../../errors/NotFoundException.ts';
import { type IImplementationContainer } from '../../implementation-containers/IImplementationContainer.ts';
import { type RepositoryError } from '../../repositories/RepositoryError.ts';

export const deleteWaitingRoom = (param: {
  readonly waitingRoomId: WaitingRoom['id'];
  readonly authenticationToken: TLongSecret;
  readonly implementationContainer: IImplementationContainer;
}): TResult<
  { waitingRoom: WaitingRoom },
  NotFoundException | IllegalAuthenticationTokenException | RepositoryError
> => {
  const findResult = param.implementationContainer.waitingRoomRepository.findById(
    param.waitingRoomId,
  );
  if (findResult instanceof Failure) {
    return findResult;
  }
  if (findResult.value === undefined) {
    return new Failure(new NotFoundException('指定されたIDの待合室は見つかりません。'));
  }

  const createContextResult = WaitingRoomOwnerContext.create({
    waitingRoom: findResult.value,
    ownerAuthenticationToken: param.authenticationToken,
  });
  if (createContextResult instanceof Failure) {
    return createContextResult;
  }

  const deleteResult = param.implementationContainer.waitingRoomRepository.delete(
    param.waitingRoomId,
  );
  if (deleteResult instanceof Failure) {
    return deleteResult;
  }

  return new Success({ waitingRoom: findResult.value });
};
