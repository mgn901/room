import { type Game, type IllegalTurnChangeExeption } from '../../../model/game/Game.ts';
import { type Player } from '../../../model/player/Player.ts';
import {
  type IllegalAuthenticationTokenException,
  PlayerContext,
} from '../../../model/player/PlayerContext.ts';
import { type TLongSecret } from '../../../utils/random-values/TLongSecret.ts';
import { Failure, Success, type TResult } from '../../../utils/result/TResult.ts';
import { NotFoundException } from '../../errors/NotFoundException.ts';
import { type IImplementationContainer } from '../../implementation-containers/IImplementationContainer.ts';
import { type RepositoryError } from '../../repositories/RepositoryError.ts';

export const changeTurn = (param: {
  readonly gameId: Game['id'];
  readonly playerId: Player['id'];
  readonly authenticationToken: TLongSecret;
  readonly implementationContainer: IImplementationContainer;
}): TResult<
  { game: Game },
  | IllegalTurnChangeExeption
  | IllegalAuthenticationTokenException
  | NotFoundException
  | RepositoryError
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

  const createContextResult = PlayerContext.create({
    target: findPlayerResult.value,
    authenticationToken: param.authenticationToken,
  });
  if (createContextResult instanceof Failure) {
    return createContextResult;
  }

  const changeTurnResult = findGameResult.value.toTurnChanged({
    context: createContextResult.value.context,
  });
  if (changeTurnResult instanceof Failure) {
    return changeTurnResult;
  }

  const saveResult = param.implementationContainer.gameRepository.save(changeTurnResult.value.game);
  if (saveResult instanceof Failure) {
    return saveResult;
  }

  return new Success({ game: changeTurnResult.value.game });
};
