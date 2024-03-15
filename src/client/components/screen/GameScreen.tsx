import { type FC } from 'react';
import { useGameClient, useWaitingRoomClient } from '../clientHooks.ts';
import { LeaveRoomWidget } from '../common/LeaveRoomWidget.tsx';
import { LoadingWidget } from '../common/LoadingWidget.tsx';
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
    return <LoadingWidget />;
  }

  if (game === undefined || me === undefined) {
    return <LeaveRoomWidget />;
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
