import { type FC } from 'react';
import { useGameClient, useWaitingRoomClient } from '../clientHooks.ts';
import { LeaveRoomPresentation } from '../common/LeaveRoomPresentation.tsx';
import { LoadingPresentation } from '../common/LoadingPresentation.tsx';
import { GameResultContainer } from '../game/GameResultContainer.tsx';
import { HandTelepresenceFpvContainer } from '../game/HandTelepresenceFpvContainer.tsx';
import { HandTelepresenceSpvContainer } from '../game/HandTelepresenceSpvContainer.tsx';
import { TpvContainer } from '../game/TpvContainer.tsx';

export const GameScreen: FC = () => {
  const waitingGameClient = useWaitingRoomClient();
  const gameClient = useGameClient();
  const game = gameClient.game;
  const me = waitingGameClient.me;

  if (gameClient.isProcessing && (game === undefined || me === undefined)) {
    return <LoadingPresentation />;
  }

  if (game === undefined || me === undefined) {
    return <LeaveRoomPresentation />;
  }

  if (game.players.length === 0) {
    return <GameResultContainer />;
  }

  if (game.playerIdProceeding === me.id) {
    return <HandTelepresenceSpvContainer />;
  }

  if (game.playerIdProceeded === me.id) {
    return <HandTelepresenceFpvContainer />;
  }

  return <TpvContainer />;
};
