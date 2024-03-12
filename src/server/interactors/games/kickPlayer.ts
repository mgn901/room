import { type IWaitingPlayer } from '../../../model/game/IWaitingPlayer.ts';
import { type WaitingRoom } from '../../../model/game/WaitingRoom.ts';
import { WaitingRoomOwnerContext } from '../../../model/game/WaitingRoomOwnerContext.ts';
import { type IllegalAuthenticationTokenException } from '../../../model/player/PlayerContext.ts';
import { type TLongSecret } from '../../../utils/random-values/TLongSecret.ts';
import { Failure, Success, type TResult } from '../../../utils/result/TResult.ts';
import { NotFoundException } from '../../errors/NotFoundException.ts';
import { type IImplementationContainer } from '../../implementation-containers/IImplementationContainer.ts';
import { type RepositoryError } from '../../repositories/RepositoryError.ts';

export const kickPlayer = (param: {
  readonly waitingRoomId: WaitingRoom['id'];
  readonly targetId: IWaitingPlayer['id'];
  readonly ownerAuthenticationToken: TLongSecret;
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
    ownerAuthenticationToken: param.ownerAuthenticationToken,
    waitingRoom: findResult.value,
  });
  if (createContextResult instanceof Failure) {
    return createContextResult;
  }

  const kickResult = findResult.value.toKicked({
    targetId: param.targetId,
    context: createContextResult.value.context,
  });

  const saveResult = param.implementationContainer.waitingRoomRepository.save(
    kickResult.value.waitingRoom,
  );
  if (saveResult instanceof Failure) {
    return saveResult;
  }

  return new Success({ waitingRoom: kickResult.value.waitingRoom });
};
