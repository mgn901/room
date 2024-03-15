import { type IWaitingPlayer } from '../../../model/game/IWaitingPlayer.ts';
import {
  type WaitingRoom,
  type WaitingRoomLeaveFailureException,
} from '../../../model/game/WaitingRoom.ts';
import {
  IllegalAuthenticationTokenException,
  PlayerContext,
} from '../../../model/player/PlayerContext.ts';
import { type TLongSecret } from '../../../utils/random-values/TLongSecret.ts';
import { Failure, Success, type TResult } from '../../../utils/result/TResult.ts';
import { NotFoundException } from '../../errors/NotFoundException.ts';
import { type IImplementationContainer } from '../../implementation-containers/IImplementationContainer.ts';
import { type RepositoryError } from '../../repositories/RepositoryError.ts';

export const leaveWaitingRoom = (param: {
  readonly waitingRoomId: WaitingRoom['id'];
  readonly targetId: IWaitingPlayer['id'];
  readonly authenticationToken: TLongSecret;
  readonly implementationContainer: IImplementationContainer;
}): TResult<
  { waitingRoom: WaitingRoom },
  | WaitingRoomLeaveFailureException
  | NotFoundException
  | IllegalAuthenticationTokenException
  | RepositoryError
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

  const target = findResult.value.players.find(
    (player) => param.authenticationToken === player.dangerouslyGetAuthenticationToken(),
  );
  if (target === undefined) {
    return new Failure(new IllegalAuthenticationTokenException('認証トークンに誤りがあります。'));
  }

  const createContextResult = PlayerContext.create({
    target,
    authenticationToken: param.authenticationToken,
  });
  if (createContextResult instanceof Failure) {
    return createContextResult;
  }

  const leaveResult = findResult.value.toLeft({
    playerId: target.id,
    context: createContextResult.value.context,
  });
  if (leaveResult instanceof Failure) {
    return leaveResult;
  }

  const saveResult = param.implementationContainer.waitingRoomRepository.save(
    leaveResult.value.waitingRoom,
  );
  if (saveResult instanceof Failure) {
    return saveResult;
  }

  return new Success({ waitingRoom: leaveResult.value.waitingRoom });
};
