import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { type IWaitingPlayer } from '../../../model/game/IWaitingPlayer.ts';
import { type TPrimitive } from '../../../utils/primitives/TPrimitive.ts';
import { isId } from '../../../utils/random-values/TId.ts';
import { useGameClient, useWaitingRoomClient } from '../clientHooks.ts';
import { LeaveRoomPresentation } from '../common/LeaveRoomPresentation.tsx';
import { LoadingPresentation } from '../common/LoadingPresentation.tsx';
import { Button } from '../common/wrappedElements.tsx';

export const WaitingRoomContainer: FC = () => {
  const navigate = useNavigate();

  const waitingRoomClient = useWaitingRoomClient();
  const gameClient = useGameClient();
  const { waitingRoom, me } = waitingRoomClient;

  useEffect(() => {
    if (gameClient.game !== undefined) {
      navigate('/game');
    }
  }, [navigate, gameClient.game]);

  if (waitingRoomClient.isProcessing && (waitingRoom === undefined || me === undefined)) {
    return <LoadingPresentation />;
  }

  if (waitingRoom === undefined || me === undefined) {
    return <LeaveRoomPresentation />;
  }

  const handleClickKickButton = (keys: TPrimitive[]) => {
    if (typeof keys[0] !== 'string' || !isId(keys[0])) {
      return;
    }
    waitingRoomClient.kickPlayer({
      waitingRoomId: waitingRoom.id,
      targetId: keys[0] as IWaitingPlayer['id'],
      ownerAuthenticationToken: me.authenticationToken,
    });
  };

  const handleClickLeaveButton = () => {
    if (waitingRoom.ownerId === me.id) {
      waitingRoomClient.delete({
        waitingRoomId: waitingRoom.id,
        authenticationToken: me.authenticationToken,
      });
      return;
    }
    waitingRoomClient.leave({
      waitingRoomId: waitingRoom.id,
      targetId: me.id,
      authenticationToken: me.authenticationToken,
    });
  };

  const handleClickStartButton = () => {
    gameClient.create({ waitingRoomId: waitingRoom.id });
  };

  return (
    <div>
      <h2>
        <span>ルーム</span>
        <span>{waitingRoom.secret}</span>
      </h2>

      <div>
        <h3>プレイヤー一覧</h3>
        <ul>
          {waitingRoom.players.map((player) => (
            <li key={player.id}>
              {player.id}
              {player.id === me.id && <span>自分</span>}
              {me.id === waitingRoom.ownerId && player.id !== me.id && (
                <Button
                  keys={[player.id]}
                  type="button"
                  onClick={handleClickKickButton}
                  disabled={waitingRoomClient.isProcessing}
                >
                  退出させる
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {waitingRoomClient.error !== undefined && !waitingRoomClient.isProcessing && (
        <div>
          <p>{waitingRoomClient.error.message}</p>
        </div>
      )}

      {gameClient.error !== undefined && !gameClient.isProcessing && (
        <div>
          <p>{gameClient.error.message}</p>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={handleClickLeaveButton}
          disabled={waitingRoomClient.isProcessing}
        >
          退出する
        </button>
        <button type="button">リンクを共有</button>
        {me.id === waitingRoom.ownerId && (
          <button
            type="button"
            onClick={handleClickStartButton}
            disabled={gameClient.isProcessing || waitingRoomClient.isProcessing}
          >
            はじめる
          </button>
        )}
      </div>
    </div>
  );
};
