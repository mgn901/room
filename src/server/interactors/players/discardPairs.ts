import { type Game } from '../../../model/game/Game.ts';
import { GamePlayerContext } from '../../../model/game/GamePlayerContext.ts';
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

export const discardPairs = (param: {
  readonly gameId: Game['id'];
  readonly playerId: Player['id'];
  readonly authenticationToken: TLongSecret;
  readonly implementationContainer: IImplementationContainer;
}): TResult<
  { game: Game; me: Player },
  NotFoundException | IllegalAuthenticationTokenException | RepositoryError
> => {
  const findMeResult = param.implementationContainer.playerRepository.findById(param.playerId);
  if (findMeResult instanceof Failure) {
    return findMeResult;
  }
  if (findMeResult.value === undefined) {
    return new Failure(new NotFoundException('指定されたIDのプレイヤーが見つかりません。'));
  }

  const findGameResult = param.implementationContainer.gameRepository.findById(param.gameId);
  if (findGameResult instanceof Failure) {
    return findGameResult;
  }
  if (findGameResult.value === undefined) {
    return new Failure(new NotFoundException('指定されたIDの競技が見つかりません。'));
  }

  const createPlayerContextResult = PlayerContext.create({
    target: findMeResult.value,
    authenticationToken: param.authenticationToken,
  });
  if (createPlayerContextResult instanceof Failure) {
    return createPlayerContextResult;
  }

  const createGamePlayerContextResult = GamePlayerContext.create({
    target: findGameResult.value,
    authenticationToken: param.authenticationToken,
  });
  if (createGamePlayerContextResult instanceof Failure) {
    return createGamePlayerContextResult;
  }

  const discardResult = findMeResult.value.toPairsDiscarded({
    context: createPlayerContextResult.value.context,
  });
  const putResult = findGameResult.value.table.toCardsPut({
    cards: discardResult.value.discarded,
    context: createGamePlayerContextResult.value.context,
  });
  const setResult = findGameResult.value.toTableSet({
    table: putResult.value.table,
    context: createGamePlayerContextResult.value.context,
  });

  const saveMeResult = param.implementationContainer.playerRepository.save(discardResult.value.me);
  if (saveMeResult instanceof Failure) {
    return saveMeResult;
  }

  const saveGameResult = param.implementationContainer.gameRepository.save(setResult.value.game);
  if (saveGameResult instanceof Failure) {
    return saveGameResult;
  }

  return new Success({ game: setResult.value.game, me: discardResult.value.me });
};
