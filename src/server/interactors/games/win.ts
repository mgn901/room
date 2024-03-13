import { type IllegalParamException } from '../../../model/errors/IllegalParamException.ts';
import { type Game } from '../../../model/game/Game.ts';
import { GamePlayerContext } from '../../../model/game/GamePlayerContext.ts';
import { type Player } from '../../../model/player/Player.ts';
import { type IllegalAuthenticationTokenException } from '../../../model/player/PlayerContext.ts';
import { type TLongSecret } from '../../../utils/random-values/TLongSecret.ts';
import { Failure, Success, type TResult } from '../../../utils/result/TResult.ts';
import { NotFoundException } from '../../errors/NotFoundException.ts';
import { type IImplementationContainer } from '../../implementation-containers/IImplementationContainer.ts';
import { type RepositoryError } from '../../repositories/RepositoryError.ts';

export const win = (param: {
  readonly gameId: Game['id'];
  readonly playerId: Player['id'];
  readonly authenticationToken: TLongSecret;
  readonly implementationContainer: IImplementationContainer;
}): TResult<
  { game: Game },
  IllegalParamException | IllegalAuthenticationTokenException | NotFoundException | RepositoryError
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

  const createContextResult = GamePlayerContext.create({
    target: findGameResult.value,
    authenticationToken: param.authenticationToken,
  });
  if (createContextResult instanceof Failure) {
    return createContextResult;
  }

  const winResult = findGameResult.value.toWinnerAdded({
    context: createContextResult.value.context,
    player: findPlayerResult.value,
  });
  if (winResult instanceof Failure) {
    return winResult;
  }

  if (winResult.value.game.winners.length === winResult.value.game.players.length) {
    const deleteResult = param.implementationContainer.gameRepository.delete(
      winResult.value.game.id,
    );
    if (deleteResult instanceof Failure) {
      return deleteResult;
    }
  } else {
    const saveResult = param.implementationContainer.gameRepository.save(winResult.value.game);
    if (saveResult instanceof Failure) {
      return saveResult;
    }
  }

  return new Success({ game: winResult.value.game });
};
