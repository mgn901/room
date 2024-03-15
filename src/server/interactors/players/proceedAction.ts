import { type Game } from '../../../model/game/Game.ts';
import { type IllegalActException, type Player } from '../../../model/player/Player.ts';
import {
  type IllegalAuthenticationTokenException,
  PlayerContext,
} from '../../../model/player/PlayerContext.ts';
import { type TLongSecret } from '../../../utils/random-values/TLongSecret.ts';
import { Failure, Success, type TResult } from '../../../utils/result/TResult.ts';
import { NotFoundException } from '../../errors/NotFoundException.ts';
import { type IImplementationContainer } from '../../implementation-containers/IImplementationContainer.ts';
import { type RepositoryError } from '../../repositories/RepositoryError.ts';

export const proceedAction = (param: {
  readonly gameId: Game['id'];
  readonly playerId: Player['id'];
  readonly index: number;
  readonly authenticationToken: TLongSecret;
  readonly implementationContainer: IImplementationContainer;
}): TResult<
  { me: Player; next: Player },
  NotFoundException | IllegalActException | IllegalAuthenticationTokenException | RepositoryError
> => {
  const findGameResult = param.implementationContainer.gameRepository.findById(param.gameId);
  if (findGameResult instanceof Failure) {
    return findGameResult;
  }
  if (findGameResult.value === undefined) {
    return new Failure(new NotFoundException('指定されたIDの競技が見つかりません。'));
  }

  const findMeResult = param.implementationContainer.playerRepository.findById(param.playerId);
  if (findMeResult instanceof Failure) {
    return findMeResult;
  }
  if (findMeResult.value === undefined) {
    return new Failure(new NotFoundException('指定されたIDのプレイヤーが見つかりません。'));
  }

  const findPlayerOnNextResult = param.implementationContainer.playerRepository.findById(
    findGameResult.value.playerIdProceeded,
  );
  if (findPlayerOnNextResult instanceof Failure) {
    return findPlayerOnNextResult;
  }
  if (findPlayerOnNextResult.value === undefined) {
    return new Failure(new NotFoundException('指定されたIDのプレイヤーが見つかりません。'));
  }

  const createContextResult = PlayerContext.create({
    authenticationToken: param.authenticationToken,
    target: findMeResult.value,
  });
  if (createContextResult instanceof Failure) {
    return createContextResult;
  }

  const proceedResult = findMeResult.value.toActionProceeded({
    game: findGameResult.value,
    playerOnNext: findPlayerOnNextResult.value,
    index: param.index,
    context: createContextResult.value.context,
  });
  if (proceedResult instanceof Failure) {
    return proceedResult;
  }

  const saveMeResult = param.implementationContainer.playerRepository.save(proceedResult.value.me);
  if (saveMeResult instanceof Failure) {
    return saveMeResult;
  }

  const savePlayerOnNextResult = param.implementationContainer.playerRepository.save(
    proceedResult.value.next,
  );
  if (savePlayerOnNextResult instanceof Failure) {
    return savePlayerOnNextResult;
  }

  return new Success({ me: proceedResult.value.me, next: proceedResult.value.next });
};
