import { describe, test } from '@jest/globals';
import { Failure } from '../../utils/result/TResult.ts';
import { PlayerContext } from '../player/PlayerContext.ts';
import { Game } from './Game.ts';
import { WaitingRoom } from './WaitingRoom.ts';

describe('Game', () => {
  test('カードの枚数', () => {
    const waitingRoom = WaitingRoom.create().value.waitingRoom;
    const result1 = waitingRoom.toJoined({ secret: waitingRoom.dangerouslyGetSecret() });
    if (result1 instanceof Failure) {
      return;
    }
    const result2 = result1.value.waitingRoom.toJoined({
      secret: result1.value.waitingRoom.dangerouslyGetSecret(),
    });
    if (result2 instanceof Failure) {
      return;
    }
    const game = Game.create({ waitingRoom: result2.value.waitingRoom });
    if (game instanceof Failure) {
      return;
    }
    for (const player of game.value.game.players) {
      const contextResult = PlayerContext.create({
        target: player,
        authenticationToken: player.dangerouslyGetAuthenticationToken(),
      });
      if (contextResult instanceof Failure) {
        continue;
      }
      const discardResult = player.toPairsDiscarded({ context: contextResult.value.context });
      if (discardResult instanceof Failure) {
        continue;
      }
      console.log(
        JSON.stringify(discardResult.value.player.cardsInHand),
        discardResult.value.discarded.length + discardResult.value.player.cardsInHand.length,
      );
    }
  });
});
