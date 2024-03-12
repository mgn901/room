import { type IWaitingPlayer } from '../../../model/game/IWaitingPlayer.ts';
import {
  type InvalidSecretException,
  type MaxPlayerCountExceededException,
  type WaitingRoom,
} from '../../../model/game/WaitingRoom.ts';
import { type TShortSecret } from '../../../utils/random-values/TShortSecret.ts';
import { Failure, Success, type TResult } from '../../../utils/result/TResult.ts';
import { NotFoundException } from '../../errors/NotFoundException.ts';
import { type IImplementationContainer } from '../../implementation-containers/IImplementationContainer.ts';
import { type RepositoryError } from '../../repositories/RepositoryError.ts';

export const joinWaitingRoom = (param: {
  readonly secret: TShortSecret;
  readonly implementationContainer: IImplementationContainer;
}): TResult<
  { waitingRoom: WaitingRoom; newPlayer: IWaitingPlayer },
  InvalidSecretException | MaxPlayerCountExceededException | NotFoundException | RepositoryError
> => {
  const findResult = param.implementationContainer.waitingRoomRepository.findBySecret(param.secret);
  if (findResult instanceof Failure) {
    return findResult;
  }
  if (findResult.value === undefined) {
    return new Failure(new NotFoundException('秘密の文字列に誤りがあります。'));
  }

  const joinResult = findResult.value.toJoined({ secret: param.secret });
  if (joinResult instanceof Failure) {
    return joinResult;
  }

  const saveResult = param.implementationContainer.waitingRoomRepository.save(
    joinResult.value.waitingRoom,
  );
  if (saveResult instanceof Failure) {
    return saveResult;
  }

  return new Success({
    waitingRoom: joinResult.value.waitingRoom,
    newPlayer: joinResult.value.newPlayer,
  });
};
